const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./db');

const signalRoute = require('./routes/signals');
const authRoute = require('./routes/auth');
const savedSignalsRoute = require('./routes/savedSignals');
const watchlistRoute = require('./routes/watchlist');

const app = express();

// CORS configuration for production security
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Middleware
app.use(express.json()); // for parsing JSON requests

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth', authLimiter);
app.use('/signals', signalRoute);
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