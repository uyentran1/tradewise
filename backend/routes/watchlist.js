const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL connection pool
const { authenticateToken, optionalAuth } = require('../middleware/auth'); // JWT middleware

/**
 * POST /watchlist
 * Add a stock symbol to user's watchlist
 * 
 * Request body should contain:
 * - symbol: stock symbol to add (e.g., "AAPL")
 */
router.post('/', authenticateToken, async (req, res) => {
    const { symbol } = req.body;
    const userId = req.user.userId; // From JWT token via authenticateToken middleware

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    try {
        // Insert into watchlist table
        // ON CONFLICT clause handles duplicate entries gracefully
        // If user tries to add same symbol twice, we just return the existing entry
        const result = await pool.query(
            `INSERT INTO watchlist (user_id, symbol) 
             VALUES ($1, $2) 
             ON CONFLICT (user_id, symbol) 
             DO UPDATE SET added_at = CURRENT_TIMESTAMP 
             RETURNING *`,
            [userId, symbol.toUpperCase()]
        );

        res.status(201).json({
            message: 'Stock added to watchlist',
            watchlistItem: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding to watchlist:', err);
        res.status(500).json({ error: 'Failed to add stock to watchlist' });
    }
});

/**
 * GET /watchlist
 * Get all stocks in user's watchlist
 * Returns array of watchlist items with basic info
 */
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    console.log('DEBUG: Fetching watchlist for userId:', userId);

    try {
        // Get all watchlist items for the user, ordered by most recently added
        const result = await pool.query(
            'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC',
            [userId]
        );

        console.log('DEBUG: Found', result.rows.length, 'watchlist items');
        res.json({ watchlist: result.rows });
    } catch (err) {
        console.error('Error fetching watchlist:', err);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

/**
 * GET /watchlist/with-signals
 * Get watchlist with latest signal data for each stock
 * This provides a more detailed view including current prices and recommendations
 */
router.get('/with-signals', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    console.log('DEBUG: Fetching watchlist with signals for userId:', userId);

    try {
        // Join watchlist with latest signals for each symbol
        // This query gets the most recent signal data for each stock in the watchlist
        const result = await pool.query(`
            SELECT 
                w.*,
                s.current_price,
                s.recommendation,
                s.confidence,
                s.score,
                s.date as signal_date
            FROM watchlist w
            LEFT JOIN (
                -- Subquery to get the latest signal for each symbol
                SELECT DISTINCT ON (symbol) 
                    symbol, current_price, recommendation, confidence, score, date
                FROM signal
                ORDER BY symbol, date DESC
            ) s ON w.symbol = s.symbol
            WHERE w.user_id = $1
            ORDER BY w.added_at DESC
        `, [userId]);

        console.log('DEBUG: Found', result.rows.length, 'watchlist items with signals');
        console.log('DEBUG: Sample watchlist item:', result.rows[0]);
        res.json({ watchlistWithSignals: result.rows });
    } catch (err) {
        console.error('Error fetching watchlist with signals:', err);
        res.status(500).json({ error: 'Failed to fetch watchlist with signals' });
    }
});

/**
 * DELETE /watchlist/:symbol
 * Remove a stock from user's watchlist
 * Uses symbol as URL parameter (e.g., DELETE /watchlist/AAPL)
 */
router.delete('/:symbol', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const symbol = req.params.symbol.toUpperCase(); // Extract symbol from URL and normalize

    try {
        // Delete the watchlist entry for this user and symbol
        const result = await pool.query(
            'DELETE FROM watchlist WHERE user_id = $1 AND symbol = $2 RETURNING *',
            [userId, symbol]
        );

        // Check if anything was actually deleted
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stock not found in watchlist' });
        }

        res.json({ 
            message: 'Stock removed from watchlist',
            removedItem: result.rows[0]
        });
    } catch (err) {
        console.error('Error removing from watchlist:', err);
        res.status(500).json({ error: 'Failed to remove stock from watchlist' });
    }
});

/**
 * GET /watchlist/check/:symbol
 * Check if a specific symbol is in user's watchlist
 * Useful for UI to show whether "Add to Watchlist" or "Remove from Watchlist" button
 */
router.get('/check/:symbol', optionalAuth, async (req, res) => {
    // Handle case where user is not authenticated
    if (!req.user || !req.user.userId) {
        return res.json({ 
            inWatchlist: false,
            watchlistItem: null
        });
    }

    const userId = req.user.userId;
    const symbol = req.params.symbol.toUpperCase();

    try {
        const result = await pool.query(
            'SELECT * FROM watchlist WHERE user_id = $1 AND symbol = $2',
            [userId, symbol]
        );

        res.json({ 
            inWatchlist: result.rows.length > 0,
            watchlistItem: result.rows[0] || null
        });
    } catch (err) {
        console.error('Error checking watchlist:', err);
        res.status(500).json({ error: 'Failed to check watchlist' });
    }
});

module.exports = router;