require('dotenv').config(); // Load environment variables from .env

const pool = require('./db');
const express = require('express');
const cors = require('cors');
const signalRoute = require('./routes/signals');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON requests
app.use('/signals', signalRoute);


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


// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

