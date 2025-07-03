const express = require('express');
const router = express.Router();
const axios = require('axios');
const { calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } = require('../utils/indicators');
const { generateRecommendation } = require('../utils/signalEngine');

// GET /signals?symbol=AAPL
router.get('/', async (req, res) => {
    const symbol = req.query.symbol;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    try {
        const apiKey = process.env.TWELVE_DATA_API_KEY;
        const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=50&apikey=${apiKey}`;

        const response = await axios.get(url);
        const prices = response.data.values;
        const price = parseFloat(prices[0].close);
        // console.log(prices);

        const sma = calculateSMA(prices);
        const rsi = calculateRSI(prices);
        const macd = calculateMACD(prices);
        const bollinger = calculateBollingerBands(prices);
        const recommendation = generateRecommendation({ rsi, macd, price, sma, bollinger });

        // Placeholder: compute indicators
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
                currentPrice: bollinger.currentPrice.toFixed(2),
            },
            recommendation
        };

        res.json(signalData);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch or process data' });
    }
});

module.exports = router;
