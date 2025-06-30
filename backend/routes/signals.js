const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /signals?symbol=AAPL
router.get('/', async (req, res) => {
    const symbol = req.query.symbol;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    try {
        const apiKey = process.env.TWELVE_DATA_API_KEY;
        const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=50&apikey=${apiKey}`;

        const response = await axios.get(url);
        const prices = response.data.values;
        // console.log(prices);

        function calculateSMA(prices, period=20) {
            const closes = prices.slice(0, period).map(p => parseFloat(p.close));
            const sum = closes.reduce((acc, val) => acc + val, 0);
            return (sum / period).toFixed(2);
        }

        const sma20 = calculateSMA(prices, 20);

        // Placeholder: compute indicators
        const signalData = {
            symbol,
            sma: sma20,
            rsi: 55.2,
            macd: { value: 1.2, signal: 0.9 },
            bollinger: {
                upper: 160.2,
                lower: 140.4,
                currentPrice: parseFloat(prices[0].close)
            },
            recommendation: 'Hold'
        };

        res.json(signalData);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch or process data' });
    }
});

module.exports = router;
