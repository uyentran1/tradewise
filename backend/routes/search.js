const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');

// GET /search?symbol=AAPL
router.get('/', async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  try {
    // Check local DB
    const result = await pool.query(
      'SELECT * FROM Stock WHERE symbol = $1',
      [symbol]
    );

    if (result.rows.length > 0) {
      return res.json({ ...result.rows[0], source: 'local' });
    }

    // Fallback to Twelve Data
    const response = await axios.get('https://api.twelvedata.com/quote', {
      params: {
        symbol,
        apikey: process.env.TWELVE_DATA_API_KEY
      }
    });

    const data = response.data;

    if (data.code || !data.name) {
      return res.status(404).json({ error: 'Stock not found via API' });
    }

    // Insert into local DB for future
    await pool.query(
      `INSERT INTO Stock (symbol, name, exchange, sector) VALUES ($1, $2, $3, $4)`,
      [symbol, data.name, data.exchange, data.sector || null]
    );

    return res.json({
      symbol,
      name: data.name,
      exchange: data.exchange,
      sector: data.sector || null,
      source: 'api'
    });

  } catch (err) {
    console.error(err.message || err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;