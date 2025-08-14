const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');
const { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands, calculateSMAArray } = require('../utils/indicators');
const { generateRecommendation } = require('../utils/signalEngine');
const { getCacheDurationInterval, logMarketStatus, detectMarketFromExchange } = require('../utils/marketHours');

const OUTPUT_SIZE = 100;

const getOrCreateStockInfo = async (symbol) => {
    try {
        // Check local DB first
        const result = await pool.query(
            'SELECT * FROM "Stock" WHERE symbol = $1',
            [symbol]
        );

        if (result.rows.length > 0) {
            return { ...result.rows[0], source: 'local' };
        }

        // Fallback to Twelve Data API
        const response = await axios.get('https://api.twelvedata.com/quote', {
            params: {
                symbol,
                apikey: process.env.TWELVE_DATA_API_KEY
            }
        });

        const data = response.data;
        console.log(data);

        if (data.code || !data.name) {
            throw new Error('Stock not found via API');
        }

        // Determine market based on exchange
        const market = detectMarketFromExchange(data.exchange);

        // Insert into local DB for future use
        await pool.query(
            `INSERT INTO "Stock" (symbol, name, exchange, market) VALUES ($1, $2, $3, $4)`,
            [symbol, data.name, data.exchange, market]
        );

        return {
            symbol,
            name: data.name,
            exchange: data.exchange,
            market,
            source: 'api'
        };

    } catch (err) {
        console.error('Error fetching stock info:', err.message || err);
        // Return minimal info as fallback
        return {
            symbol,
            name: symbol,
            exchange: null,
            market: 'US',
            source: 'fallback'
        };
    }
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
        
        if (response.data.status === 'error') {
            console.error('TwelveData API error:', response.data);
            throw new Error(`TwelveData API error: ${response.data.message || 'Unknown error'}`);
        }
        
        let prices = response.data?.values; // response.data is typically {meta : {}, values: [], status: ok}
        
        // Sort prices by datetime (oldest first) for proper calculation
        if (prices && Array.isArray(prices)) {
            prices = prices.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        }
        
        return prices;
    } catch (err) {
        console.error('Error fetching from Twelve Data API: ', err.message || err);
        if (err.response) {
            console.error('API Response data:', err.response.data);
        }
        throw err;
    }
};

const getCachedSignalIfExists = async (symbol, date) => {
    // Get cache duration based on market hours for the specific symbol's market
    const cacheInterval = await getCacheDurationInterval(symbol);
    
    // Log market status for debugging
    await logMarketStatus(symbol);
    
    console.log(`DEBUG: Checking cache for ${symbol} on ${date} with ${cacheInterval} expiration`);
    
    // Find if there is previous cache still valid (within interval)
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

const getCachedData = (cachedSignal, prices, stockInfo) => {
    const row = cachedSignal.rows[0];
    
    // Calculate price change for cached data
    const currentPrice = parseFloat(row.current_price);
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
        companyName: stockInfo.name,
        sma: parseFloat(row.sma),
        rsi: parseFloat(row.rsi),
        macd: {
            value: parseFloat(row.macd_value),
            signal: parseFloat(row.macd_signal),
            macdHistory: macdData.macdHistory,
            signalHistory: macdData.signalHistory,
            macdArray: macdData.macdArray || [],
            signalArray: macdData.signalArray || []
        },
        bollinger: {
            upper: parseFloat(row.bollinger_upper),
            lower: parseFloat(row.bollinger_lower),
            array: bollingerData // Full array for charting
        },
        currentPrice,
        priceChange,
        priceChangePercent,
        confidence: parseFloat(row.confidence),
        score: parseFloat(row.score),
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

    let prices;

    try {
        prices = await fetchPriceData(symbol);

    } catch (err) {
        // Rate limit error
        if (err.response?.status === 429 || err.message?.includes('rate limit') || err.message?.includes('quota')) {
            return res.status(429).json({ error: 'Max queries exceeded. Please try again in the next minute.' });
        }
        // Invalid symbol error
        if (err.response?.status === 400 || err.message?.includes('valid') || err.message?.includes('not found')) {
            return res.status(404).json({ error: 'Invalid symbol. Please enter a valid stock symbol.' });
        }
        // Generic error for other cases
        return res.status(503).json({ error: 'Unable to fetch stock data. Please try again later.' });
    }
    
    if (!prices || prices.length <= 0) {
        return res.status(404).json({ error: 'No data found for this symbol.' });
    }
    
    try {
        console.log(`DEBUG: Fetched ${prices.length} price points for ${symbol}`);
        console.log('DEBUG: First price:', prices[0]);
        console.log('DEBUG: Last price:', prices[prices.length - 1]);

        const latestDate = prices[prices.length - 1].datetime; // Most recent date after sorting
        
        // Get or create stock info with exchange and market data
        const stockInfo = await getOrCreateStockInfo(symbol);
        
        // Return cached data if it exists in database
        const cachedSignal = await getCachedSignalIfExists(symbol, latestDate);
        if (cachedSignal) {
            const cachedData = getCachedData(cachedSignal, prices, stockInfo);
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
        // Use UPSERT (INSERT ... ON CONFLICT) to overwrite existing cache entries with newer values
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
            companyName: stockInfo.name,
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
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

module.exports = router;