const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');
const { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } = require('../utils/indicators');
const { generateRecommendation } = require('../utils/signalEngine');

const OUTPUT_SIZE = 100;

// Get customised weights of indicators from query or use default values
const parseWeights = (query) => {
    return {
        rsi: parseFloat(query.rsiWeight) || 3,
        macd: parseFloat(query.macdWeight) || 2,
        sma: parseFloat(query.smaWeight) || 1.5,
        bollinger: parseFloat(query.bollingerWeight) || 1,
    };
};

const fetchPriceData = async (symbol) => {
    const url = `https://api.twelvedata.com/time_series`;
    const params = {
        symbol,
        interval: '1day',
        outputsize: OUTPUT_SIZE,
        apikey: process.env.TWELVE_DATA_API_KEY
    };

    try {
        const response = await axios.get(url, {params});
        let prices = response.data?.values;
        
        // Sort prices by datetime (oldest first) for proper calculation
        if (prices && Array.isArray(prices)) {
            prices = prices.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        }
        
        return prices;
    } catch (err) {
        console.error('Error fetching from Twelve Data API: ', err.message || err);
        throw err;
    }
};

const getCachedSignalIfExists = async (symbol, date) => {
    const res = await pool.query(
        `SELECT * FROM Signal WHERE symbol = $1 AND date = $2`,
        [symbol, date]
    );
    return res.rows.length > 0 ? res : null;
};

const getCachedData = (cachedSignal, prices) => {
    const row = cachedSignal.rows[0];
    
    // Calculate price change for cached data
    const currentPrice = row.current_price;
    const previousPrice = prices.length >= 2 ? parseFloat(prices[prices.length - 2].close) : currentPrice;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
    
    const cachedData = {
        symbol: row.symbol,
        sma: row.sma,
        rsi: row.rsi,
        macd: {
            value: row.macd_value,
            signal: row.macd_signal
        },
        bollinger: {
            upper: row.bollinger_upper,
            lower: row.bollinger_lower,
        },
        currentPrice: row.current_price,
        priceChange,
        priceChangePercent,
        score: row.score,
        recommendation: row.recommendation,
        explanation: row.explanation,
        source: 'cached',
        prices, // Sorted price data for charting
        smaData: calculateSMAArray(prices) // Add SMA array for charting
    };
    
    return cachedData;
};

// Enhanced calculation of SMA array for charting
const calculateSMAArray = (prices, period = 20) => {
    if (!prices || prices.length < period) return [];
    
    const smaArray = [];
    
    for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, price) => acc + parseFloat(price.close), 0);
        const smaValue = sum / period;
        
        smaArray.push({
            datetime: prices[i].datetime,
            value: smaValue
        });
    }
    
    return smaArray;
};

// Enhanced technical analysis with more context
const enhanceAnalysis = (indicators, prices) => {
    const { rsi, macd, sma, bollinger, currentPrice } = indicators;
    const enhancements = {};
    
    // Calculate price trend over different periods
    const recentPrices = prices.slice(-5).map(p => parseFloat(p.close));
    const weekTrend = recentPrices.length >= 5 ? 
        ((recentPrices[4] - recentPrices[0]) / recentPrices[0]) * 100 : 0;
    
    // Add trend analysis
    enhancements.trend = {
        direction: weekTrend > 1 ? 'BULLISH' : weekTrend < -1 ? 'BEARISH' : 'SIDEWAYS',
        strength: Math.abs(weekTrend),
        weekChange: weekTrend
    };
    
    // Add momentum analysis
    enhancements.momentum = {
        rsiMomentum: rsi > 50 ? 'BULLISH' : 'BEARISH',
        macdMomentum: macd.value > macd.signal ? 'BULLISH' : 'BEARISH',
        overall: (rsi > 50 && macd.value > macd.signal) ? 'BULLISH' : 
                (rsi < 50 && macd.value < macd.signal) ? 'BEARISH' : 'MIXED'
    };
    
    // Add volatility analysis
    const priceRange = prices.slice(-20).map(p => parseFloat(p.high) - parseFloat(p.low));
    const avgRange = priceRange.reduce((a, b) => a + b, 0) / priceRange.length;
    const volatility = (avgRange / currentPrice) * 100;
    
    enhancements.volatility = {
        level: volatility > 3 ? 'HIGH' : volatility > 1.5 ? 'MEDIUM' : 'LOW',
        percentage: volatility,
        bollingerWidth: ((bollinger.upper - bollinger.lower) / sma) * 100
    };
    
    // Calculate confidence based on signal alignment
    let signalAlignment = 0;
    if (rsi > 50) signalAlignment++;
    if (rsi < 50) signalAlignment--;
    if (macd.value > macd.signal) signalAlignment++;
    if (macd.value < macd.signal) signalAlignment--;
    if (currentPrice > sma) signalAlignment++;
    if (currentPrice < sma) signalAlignment--;
    
    enhancements.confidence = {
        level: Math.abs(signalAlignment) >= 2 ? 'HIGH' : Math.abs(signalAlignment) === 1 ? 'MEDIUM' : 'LOW',
        score: Math.abs(signalAlignment),
        alignment: signalAlignment > 0 ? 'BULLISH' : signalAlignment < 0 ? 'BEARISH' : 'NEUTRAL'
    };
    
    return enhancements;
};

// Generate enhanced explanation based on technical analysis
const generateEnhancedExplanation = (indicators, enhancements, recommendation) => {
    const { rsi, macd, sma, bollinger, currentPrice } = indicators;
    const explanation = [];
    
    // Overall recommendation context
    explanation.push(`📈 Overall Signal: ${recommendation} - Based on comprehensive technical analysis`);
    
    // Trend analysis
    explanation.push(`📊 Trend: ${enhancements.trend.direction} with ${enhancements.trend.strength.toFixed(1)}% weekly change`);
    
    // Individual indicator insights
    if (rsi > 70) {
        explanation.push(`⚠️ RSI at ${rsi.toFixed(1)} suggests overbought conditions - potential selling pressure`);
    } else if (rsi < 30) {
        explanation.push(`💡 RSI at ${rsi.toFixed(1)} indicates oversold conditions - potential buying opportunity`);
    } else {
        explanation.push(`✅ RSI at ${rsi.toFixed(1)} shows neutral momentum in healthy range`);
    }
    
    // MACD insights
    const macdSignal = macd.value > macd.signal ? 'bullish' : 'bearish';
    explanation.push(`📈 MACD shows ${macdSignal} momentum (${macd.value.toFixed(4)} vs ${macd.signal.toFixed(4)})`);
    
    // Price vs SMA
    const smaRelation = currentPrice > sma ? 'above' : 'below';
    const smaPercent = (((currentPrice - sma) / sma) * 100).toFixed(1);
    explanation.push(`📍 Price is ${Math.abs(smaPercent)}% ${smaRelation} SMA, indicating ${currentPrice > sma ? 'bullish' : 'bearish'} trend`);
    
    // Bollinger Bands context
    if (currentPrice >= bollinger.upper * 0.98) {
        explanation.push(`🔴 Price near Bollinger upper band - consider taking profits`);
    } else if (currentPrice <= bollinger.lower * 1.02) {
        explanation.push(`🟢 Price near Bollinger lower band - potential buying opportunity`);
    } else {
        explanation.push(`⚖️ Price within Bollinger bands - normal trading range`);
    }
    
    // Volatility and confidence
    explanation.push(`📊 Market volatility: ${enhancements.volatility.level} (${enhancements.volatility.percentage.toFixed(1)}%)`);
    explanation.push(`🎯 Signal confidence: ${enhancements.confidence.level} - ${enhancements.confidence.score}/3 indicators aligned`);
    
    return explanation;
};

// GET /signals?symbol=XYZ
router.get('/', async (req, res) => {
    const symbol = req.query.symbol?.toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    try {
        const prices = await fetchPriceData(symbol);
        if (!prices || prices.length === 0) {
            return res.status(404).json({ error: 'No price data found for symbol' });
        }

        const latestDate = prices[prices.length - 1].datetime; // Most recent date after sorting
        
        // Return cached data if it exists in database
        const cachedSignal = await getCachedSignalIfExists(symbol, latestDate);
        if (cachedSignal) {
            const cachedData = getCachedData(cachedSignal, prices);
            // Add SMA array for charting
            cachedData.smaData = calculateSMAArray(prices);
            return res.json(cachedData);
        }
        
        // Calculate all technical indicators
        const sma = calculateSMA(prices);
        const rsi = calculateRSI(prices);
        const macd = calculateMACD(prices);
        const bollinger = calculateBollingerBands(prices);
        const weights = parseWeights(req.query);
        const currentPrice = parseFloat(prices[prices.length - 1].close); // Latest price after sorting
        
        // Calculate price change vs previous day
        const previousPrice = prices.length >= 2 ? parseFloat(prices[prices.length - 2].close) : currentPrice;
        const priceChange = currentPrice - previousPrice;
        const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
        
        // Generate recommendation using existing engine
        const { score, recommendation, explanation: basicExplanation } = generateRecommendation({ 
            rsi, macd, currentPrice, sma, bollinger, weights 
        });
        
        // Enhanced analysis
        const enhancements = enhanceAnalysis({ rsi, macd, sma, bollinger, currentPrice }, prices);
        const enhancedExplanation = generateEnhancedExplanation({ rsi, macd, sma, bollinger, currentPrice }, enhancements, recommendation);
        
        // Calculate SMA array for charting
        const smaData = calculateSMAArray(prices);

        // Save signal to database with enhanced data
        await pool.query(
            `INSERT INTO Signal (
                symbol, date, sma, rsi, macd_value, macd_signal, bollinger_upper, 
                bollinger_lower, current_price, score, recommendation, explanation
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
            [symbol, latestDate, sma, rsi, macd.value, macd.signal, bollinger.upper, bollinger.lower, currentPrice, score, recommendation, enhancedExplanation]
        );

        const signalData = {
            symbol,
            sma,
            rsi,
            macd: { 
                value: macd.value,
                signal: macd.signal,
            },
            bollinger: {
                upper: bollinger.upper,
                lower: bollinger.lower,
            },
            currentPrice,
            priceChange,
            priceChangePercent,
            score,
            recommendation,
            explanation: enhancedExplanation,
            // Enhanced analysis data
            trend: enhancements.trend,
            momentum: enhancements.momentum,
            volatility: enhancements.volatility,
            confidence: enhancements.confidence,
            source: 'fresh',
            prices, // Sorted price data for charting
            smaData // SMA array for charting overlays
        };

        res.json(signalData);
    } catch (err) {
        console.error('Signal analysis error:', err.message || err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;