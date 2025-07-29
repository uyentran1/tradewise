const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');
const { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands, calculateSMAArray } = require('../utils/indicators');
const { generateRecommendation } = require('../utils/signalEngine');
const { getCacheDurationInterval, logMarketStatus } = require('../utils/marketHours');

const OUTPUT_SIZE = 100;

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
        let prices = response.data?.values; // response.data is typically {meta : {}, values: [], status: ok}
        
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
    // Get cache duration based on market hours (hybrid approach)
    const cacheInterval = getCacheDurationInterval();
    
    // Log market status for debugging
    logMarketStatus();
    
    console.log(`DEBUG: Checking cache for ${symbol} on ${date} with ${cacheInterval} expiration`);
    
    const res = await pool.query(
        `SELECT * FROM signal WHERE symbol = $1 AND date = $2 
         AND cached_at > NOW() - INTERVAL '${cacheInterval}'`,
        [symbol, date]
    );
    
    if (res.rows.length > 0) {
        console.log(`DEBUG: Cache HIT for ${symbol} - using cached data from ${res.rows[0].cached_at}`);
        return res;
    } else {
        console.log(`DEBUG: Cache MISS for ${symbol} - will fetch fresh data`);
        return null;
    }
};

const getCachedData = (cachedSignal, prices) => {
    const row = cachedSignal.rows[0];
    
    // Calculate price change for cached data
    const currentPrice = row.current_price;
    const previousPrice = prices.length >= 2 ? parseFloat(prices[prices.length - 2].close) : currentPrice;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

    // Parse cached SMA data if it exists, otherwise calculate it
    let smaData = [];
    if (row.sma_data) {
        try {
            smaData = typeof row.sma_data === 'string' ? JSON.parse(row.sma_data) : row.sma_data;
        } catch (e) {
            console.warn('Failed to parse cached SMA data, recalculating...');
            smaData = calculateSMAArray(prices);
        }
    } else {
        // Fallback: calculate SMA data if not cached
        smaData = calculateSMAArray(prices);
    }

    // Parse cached Bollinger Bands data if it exists, otherwise calculate it
    let bollingerData = [];
    if (row.bollinger_data) {
        try {
            bollingerData = typeof row.bollinger_data === 'string' ? JSON.parse(row.bollinger_data) : row.bollinger_data;
        } catch (e) {
            console.warn('Failed to parse cached Bollinger data, recalculating...');
            const bollingerResult = calculateBollingerBands(prices);
            bollingerData = bollingerResult.array;
        }
    } else {
        // Fallback: calculate Bollinger data if not cached
        const bollingerResult = calculateBollingerBands(prices);
        bollingerData = bollingerResult.array;
    }

    // Parse cached MACD data if it exists, otherwise calculate it
    let macdData = { macdHistory: [], signalHistory: [] };
    if (row.macd_data) {
        try {
            macdData = typeof row.macd_data === 'string' ? JSON.parse(row.macd_data) : row.macd_data;
        } catch (e) {
            console.warn('Failed to parse cached MACD data, recalculating...');
            const macdResult = calculateMACD(prices);
            macdData = {
                macdHistory: macdResult.macdHistory,
                signalHistory: macdResult.signalHistory,
                macdArray: macdResult.macdArray,
                signalArray: macdResult.signalArray
            };
        }
    } else {
        // Fallback: calculate MACD data if not cached
        const macdResult = calculateMACD(prices);
        macdData = {
            macdHistory: macdResult.macdHistory,
            signalHistory: macdResult.signalHistory,
            macdArray: macdResult.macdArray,
            signalArray: macdResult.signalArray
        };
    }

    // Parse cached contributions and components if they exist
    let contributions = {};
    let components = {};
    try {
        if (row.contributions) {
            contributions = typeof row.contributions === 'string' ? JSON.parse(row.contributions) : row.contributions;
        }
        if (row.components) {
            components = typeof row.components === 'string' ? JSON.parse(row.components) : row.components;
        }
    } catch (e) {
        console.warn('Failed to parse cached analysis data');
    }
    
    const cachedData = {
        symbol: row.symbol,
        sma: row.sma,
        rsi: row.rsi,
        macd: {
            value: row.macd_value,
            signal: row.macd_signal,
            macdHistory: macdData.macdHistory,
            signalHistory: macdData.signalHistory,
            macdArray: macdData.macdArray || [],
            signalArray: macdData.signalArray || []
        },
        bollinger: {
            upper: row.bollinger_upper,
            lower: row.bollinger_lower,
            array: bollingerData // Full array for charting
        },
        currentPrice: row.current_price,
        priceChange,
        priceChangePercent,
        confidence: row.confidence,
        score: row.score,
        recommendation: row.recommendation,
        explanation: row.explanation,
        contributions,
        components,
        source: 'cached',
        prices, // Sorted price data for charting
        smaData,
        bollingerData // For backwards compatibility
    };
    
    return cachedData;
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
        
        console.log(`DEBUG: Fetched ${prices.length} price points for ${symbol}`);
        console.log('DEBUG: First price:', prices[0]);
        console.log('DEBUG: Last price:', prices[prices.length - 1]);

        const latestDate = prices[prices.length - 1].datetime; // Most recent date after sorting
        
        // Return cached data if it exists in database
        const cachedSignal = await getCachedSignalIfExists(symbol, latestDate);
        if (cachedSignal) {
            const cachedData = getCachedData(cachedSignal, prices);
            return res.json(cachedData);
        }
        
        // Calculate all technical indicators
        const sma = calculateSMA(prices);
        const rsi = calculateRSI(prices);
        const macd = calculateMACD(prices);
        const bollingerResult = calculateBollingerBands(prices);
        const currentPrice = parseFloat(prices[prices.length - 1].close); // Latest price after sorting
        
        // Calculate price change vs previous day
        const previousPrice = prices.length >= 2 ? parseFloat(prices[prices.length - 2].close) : currentPrice;
        const priceChange = currentPrice - previousPrice;
        const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
        
        const smaData = calculateSMAArray(prices); // Calculate SMA array for charting
        
        // Use the latest values for recommendation calculation
        const analysisResult = generateRecommendation({ 
            rsi, 
            macd, 
            currentPrice, 
            sma, 
            bollinger: {
                upper: bollingerResult.upper,
                lower: bollingerResult.lower
            }, 
        });

        // Save signal to database with both latest values and full arrays
        // Use UPSERT (INSERT ... ON CONFLICT) to update existing cache entries
        await pool.query(
            `INSERT INTO signal (
                symbol, date, sma, rsi, macd_value, macd_signal, bollinger_upper, bollinger_lower, 
                current_price, score, confidence, recommendation, explanation, sma_data, bollinger_data, macd_data,
                contributions, components, cached_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,CURRENT_TIMESTAMP)
            ON CONFLICT (symbol, date) 
            DO UPDATE SET 
                sma = EXCLUDED.sma,
                rsi = EXCLUDED.rsi,
                macd_value = EXCLUDED.macd_value,
                macd_signal = EXCLUDED.macd_signal,
                bollinger_upper = EXCLUDED.bollinger_upper,
                bollinger_lower = EXCLUDED.bollinger_lower,
                current_price = EXCLUDED.current_price,
                score = EXCLUDED.score,
                confidence = EXCLUDED.confidence,
                recommendation = EXCLUDED.recommendation,
                explanation = EXCLUDED.explanation,
                sma_data = EXCLUDED.sma_data,
                bollinger_data = EXCLUDED.bollinger_data,
                macd_data = EXCLUDED.macd_data,
                contributions = EXCLUDED.contributions,
                components = EXCLUDED.components,
                cached_at = CURRENT_TIMESTAMP`,
            [
                symbol, 
                latestDate, 
                sma, 
                rsi, 
                macd.value, 
                macd.signal, 
                bollingerResult.upper, 
                bollingerResult.lower, 
                currentPrice, 
                analysisResult.score, 
                analysisResult.confidence,
                analysisResult.recommendation, 
                analysisResult.explanation, 
                JSON.stringify(smaData),
                JSON.stringify(bollingerResult.array), // Store full Bollinger array
                JSON.stringify({
                    macdHistory: macd.macdHistory,
                    signalHistory: macd.signalHistory,
                    macdArray: macd.macdArray,
                    signalArray: macd.signalArray
                }), // Store full MACD arrays with datetime
                JSON.stringify(analysisResult.contributions || {}),
                JSON.stringify(analysisResult.components || {})
            ]
        );

        const signalData = {
            symbol,
            sma,
            rsi,
            macd: { 
                value: macd.value,
                signal: macd.signal,
                macdHistory: macd.macdHistory,
                signalHistory: macd.signalHistory,
                macdArray: macd.macdArray,
                signalArray: macd.signalArray
            },
            bollinger: {
                upper: bollingerResult.upper,
                lower: bollingerResult.lower,
                array: bollingerResult.array // Full array for charting
            },
            currentPrice,
            priceChange,
            priceChangePercent,
            score: analysisResult.score,
            confidence: analysisResult.confidence,
            recommendation: analysisResult.recommendation,
            explanation: analysisResult.explanation,
            contributions: analysisResult.contributions,
            components: analysisResult.components,
            source: 'fresh',
            prices, // Sorted price data for charting
            smaData, // SMA array for charting overlays
            bollingerData: bollingerResult.array // For backwards compatibility
        };

        res.json(signalData);
    } catch (err) {
        console.error('Signal analysis error:', err.message || err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;