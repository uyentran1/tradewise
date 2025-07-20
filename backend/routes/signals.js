const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');
const { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } = require('../utils/indicators');
const { generateRecommendation } = require('../utils/signalEngine');

const OUTPUT_SIZE = 50;

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
        score: row.score,
        recommendation: row.recommendation,
        explanation: row.explanation,
        source: 'cached',
        prices // For charting
    };
    
    return cachedData;
};

// GET /signals?symbol=XYZ
router.get('/', async (req, res) => {
    const symbol = req.query.symbol?.toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    try {
        const prices = await fetchPriceData(symbol);
        console.log(prices);

        const date = prices[0].datetime;
        
        // Return cached data if it is database
        const cachedSignal = await getCachedSignalIfExists(symbol, date);
        if (cachedSignal) {
            const cachedData = getCachedData(cachedSignal, prices);
            return res.json(cachedData);
        }
        
        const sma = calculateSMA(prices);
        const rsi = calculateRSI(prices);
        const macd = calculateMACD(prices);
        const bollinger = calculateBollingerBands(prices);
        const weights = parseWeights(req.query);
        const currentPrice = parseFloat(prices[0].close);
        const { score, recommendation, explanation } = generateRecommendation({ rsi, macd, currentPrice, sma, bollinger, weights });

        // Save signal to database
        await pool.query(
            `INSERT INTO Signal (
                symbol, date, sma, rsi, macd_value, macd_signal, bollinger_upper, 
                bollinger_lower, current_price, score, recommendation, explanation
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
            [symbol, date, sma, rsi, macd.value, macd.signal, bollinger.upper, bollinger.lower, currentPrice, score, recommendation, explanation]
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
            score,
            recommendation,
            explanation,
            source: 'fresh',
            prices // For charting
        };

        res.json(signalData);
    } catch (err) {
        console.error(err.message || err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
