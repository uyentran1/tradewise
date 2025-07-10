const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /auth/register
router.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) 
        return res.status(400).json({ error: 'Full name, email and password are required.' });

    try {
        // Check if email already exists
        const userCheck = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ error: 'This email has already been registered.' });

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert into database
        const newUser = await pool.query(
            'INSERT INTO "User" (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at',
            [fullName, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered', user: newUser.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required' });

    try {
        const userQuery = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (userQuery.rows.length === 0)
        return res.status(401).json({ error: 'Invalid credentials' });

        const user = userQuery.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate JWT
        const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;