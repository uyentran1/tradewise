const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL connection pool
const { authenticateToken } = require('../middleware/auth'); // JWT middleware

// Apply authentication middleware to all routes in this file
// This means all routes require a valid JWT token
router.use(authenticateToken);

/**
 * POST /saved-signals
 * Save a signal for future review
 * 
 * Request body should contain:
 * - symbol: stock symbol (e.g., "AAPL")
 * - signalData: complete signal object from frontend
 * - notes: optional user notes
 */
router.post('/', async (req, res) => {
    const { symbol, signalData, notes } = req.body;
    
    // req.user is available because of authenticateToken middleware
    // It contains { userId, email, fullName } from the JWT token
    const userId = req.user.userId; 

    if (!symbol || !signalData) {
        return res.status(400).json({ error: 'Symbol and signal data are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO saved_signals (user_id, symbol, signal_data, notes) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, symbol.toUpperCase(), JSON.stringify(signalData), notes || null]
        );

        res.status(201).json({
            message: 'Signal saved successfully',
            savedSignal: result.rows[0]
        });
    } catch (err) {
        console.error('Error saving signal:', err);
        res.status(500).json({ error: 'Failed to save signal' });
    }
});

/**
 * GET /saved-signals
 * Get all saved signals for the authenticated user
 * Optional query parameters:
 * - symbol: filter by specific stock symbol
 * - limit: limit number of results (default 50)
 */
router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const { symbol, limit = 50 } = req.query;

    console.log('DEBUG: Fetching saved signals for userId:', userId, 'with limit:', limit);

    try {
        let query = 'SELECT * FROM saved_signals WHERE user_id = $1';
        let params = [userId];

        if (symbol) {
            query += ' AND symbol = $2';
            params.push(symbol.toUpperCase());
        }

        // Add ordering and limit
        query += ' ORDER BY saved_at DESC LIMIT $' + (params.length + 1);
        params.push(parseInt(limit));

        const result = await pool.query(query, params);

        console.log('DEBUG: Found', result.rows.length, 'saved signals');

        // Parse the JSON signal_data back to objects for frontend consumption
        const savedSignals = result.rows.map(row => ({
            ...row,
            signal_data: typeof row.signal_data === 'string' 
                ? JSON.parse(row.signal_data) 
                : row.signal_data
        }));

        console.log('DEBUG: Returning saved signals:', savedSignals.length);
        res.json({ savedSignals });
    } catch (err) {
        console.error('Error fetching saved signals:', err);
        res.status(500).json({ error: 'Failed to fetch saved signals' });
    }
});

/**
 * DELETE /saved-signals/:id
 * Delete a specific saved signal
 * Only allows deletion of signals owned by the authenticated user
 */
router.delete('/:id', async (req, res) => {
    const userId = req.user.userId;
    const signalId = req.params.id; // Extract ID from URL parameter

    try {
        // Delete only if the signal belongs to the authenticated user
        // This prevents users from deleting other users' saved signals
        const result = await pool.query(
            'DELETE FROM saved_signals WHERE id = $1 AND user_id = $2 RETURNING *',
            [signalId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Saved signal not found or unauthorized' });
        }

        res.json({ message: 'Signal deleted successfully' });
    } catch (err) {
        console.error('Error deleting saved signal:', err);
        res.status(500).json({ error: 'Failed to delete signal' });
    }
});

/**
 * PUT /saved-signals/:id/notes
 * Update notes for a saved signal
 */
router.put('/:id/notes', async (req, res) => {
    const userId = req.user.userId;
    const signalId = req.params.id;
    const { notes } = req.body;

    try {
        const result = await pool.query(
            'UPDATE saved_signals SET notes = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [notes || null, signalId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Saved signal not found or unauthorized' });
        }

        res.json({
            message: 'Notes updated successfully',
            savedSignal: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating notes:', err);
        res.status(500).json({ error: 'Failed to update notes' });
    }
});

module.exports = router;