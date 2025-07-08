const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');
const { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } = require('../utils/indicators');
const { generateRecommendation } = require('../utils/signalEngine');

// Helper function to fetch price data with retry if insufficient data
const fetchPriceData = async (symbol) => {
    const url = `https://api.twelvedata.com/time_series`;
    const params = {
        symbol,
        interval: '1day',
        outputsize: 100,
        apikey: process.env.TWELVE_DATA_API_KEY
    };

    try {
        const response = await axios.get(url, {params});
        let prices = response.data?.values;
        // console.log(prices);

        if (!prices || prices.length < 30) {
            console.log('Initial fetch insufficient. Retrying Twelve Data API...');
            const retryResponse = await axios.get(url, { params });
            prices = retryResponse.data?.values;
        }

        return prices;
    } catch (err) {
        console.error('Error fetching from Twelve Data API: ', err.message || err);
        throw err;
    }
};

// GET /signals?symbol=XYZ
router.get('/', async (req, res) => {
    const symbol = req.query.symbol?.toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    try {
        // Fetch price data with retry logic
        const prices = await fetchPriceData(symbol);
        if (!prices || prices.length < 30) {
            return res.status(400).json({ error: 'Still not enough data after retry' });
        }

        const price = parseFloat(prices[0].close);
        const date = prices[0].datetime;
        // console.log(prices);

        // Check for duplicate
        const existingSignal = await pool.query(
            `SELECT * FROM Signal WHERE symbol = $1 AND date = $2`,
            [symbol, date]
        )

        if (existingSignal.rows.length > 0) {
            const row = existingSignal.rows[0];
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
                    currentPrice: row.current_price
                },
                recommendation: row.recommendation,
                explanation: row.explanation,
                source: 'cached'
            };
            return res.json(cachedData);
        }

        // Calculate indicators
        const sma = calculateSMA(prices);
        const rsi = calculateRSI(prices);
        const macd = calculateMACD(prices);
        const bollinger = calculateBollingerBands(prices);
        const { recommendation, explanation } = generateRecommendation({ rsi, macd, price, sma, bollinger });

        // Insert into DB
        await pool.query(
            `INSERT INTO Signal (
                symbol, date, sma, rsi, macd_value, macd_signal,
                bollinger_upper, bollinger_lower, current_price,
                recommendation, explanation
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
             [
                symbol, date, sma, rsi, macd.value, macd.signal,
                bollinger.upper, bollinger.lower, price,
                recommendation, explanation
             ]
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
                currentPrice: price,
            },
            recommendation,
            explanation,
            source: 'fresh'
        };

        res.json(signalData);

    } catch (err) {
        console.error(err.message || err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
