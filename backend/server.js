const express = require('express');
const cors = require('cors');
const pool = require('./db');

const signalRoute = require('./routes/signals');
const searchRoute = require('./routes/search');
const authRoute = require('./routes/auth');
const savedSignalsRoute = require('./routes/savedSignals');
const watchlistRoute = require('./routes/watchlist');

const app = express();

app.use(cors()); // Middleware
app.use(express.json()); // for parsing JSON requests

app.use('/signals', signalRoute);
app.use('/search', searchRoute);
app.use('/auth', authRoute);
app.use('/saved-signals', savedSignalsRoute);
app.use('/watchlist', watchlistRoute);

// Test routes
app.get('/', (req, res) => res.send('TradeWise backend server is running'));

app.get('/time', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

module.exports = app;