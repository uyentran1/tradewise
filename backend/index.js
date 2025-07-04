require('dotenv').config(); // Load environment variables from .env
const app = require('./server');
const pool = require('./db');

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown, close pool on exit
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});