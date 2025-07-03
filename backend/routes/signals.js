const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');
const { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } = require('../utils/indicators');
const { generateRecommendation } = require('../utils/signalEngine');

// GET /signals?symbol=XYZ
router.get('/', async (req, res) => {
    const symbol = req.query.symbol?.toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    try {
        // Fetch price data from Twelve Data
        // const apiKey = process.env.TWELVE_DATA_API_KEY;
        // const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=50&apikey=${apiKey}`;
        // const response = await axios.get(url);

        const response = await axios.get(`https://api.twelvedata.com/time_series`, {
            params : {
                symbol,
                interval: '1day',
                outputsize: 100,
                apikey: process.env.TWELVE_DATA_API_KEY
            }
        });

        const prices = response.data?.values;
        if (!prices || prices.length < 30) {
            return res.status(400).json({ error: 'Insufficient data for signal generation' });
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
            return res.json({
                ...existingSignal.rows[0],
                source: 'cached'
            });
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
            sma: sma.toFixed(2),
            rsi: rsi.toFixed(2),
            macd: { 
                value: macd.value.toFixed(2), 
                signal: macd.signal.toFixed(2),
            },
            bollinger: {
                upper: bollinger.upper.toFixed(2),
                lower: bollinger.lower.toFixed(2),
                currentPrice: price.toFixed(2),
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
