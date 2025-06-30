// Load environment variables from .env
require('dotenv').config();
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

const pool = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON requests

// Simple test route
app.get('/', (req, res) => {
  res.send('TradeWise backend server is running');
});

app.get('/time', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

// Register route
const signalRoute = require('./routes/signals');
app.use('/signals', signalRoute);


// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

