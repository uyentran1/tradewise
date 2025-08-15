const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validatePassword } = require('../utils/passwordSecurity');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/register
router.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) 
        return res.status(400).json({ error: 'Full name, email and password are required.' });

    try {
        // Validate password security
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                error: `Password validation failed:\n ${passwordValidation.errors.join('.\n')}`,
                details: passwordValidation.errors,
                requirements: passwordValidation.requirements,
                strength: passwordValidation.strength
            });
        }

        // Check if email already exists
        const userCheck = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ error: 'This email has already been registered.' });

        // Hash the password
        const saltRounds = 12; // Increased from 10 for better security
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert into database
        const newUser = await pool.query(
            'INSERT INTO "User" (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at',
            [fullName, email, hashedPassword]
        );

        res.status(201).json({ 
            message: 'User registered successfully.', 
            user: newUser.rows[0],
            passwordStrength: passwordValidation.strength.label
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required.' });

    try {
        const userQuery = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
        if (userQuery.rows.length === 0)
        return res.status(401).json({ error: 'This email has not been registered.' });

        const user = userQuery.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password.' });

        // Generate JWT
        const token = jwt.sign(
        { 
            userId: user.id, 
            email: user.email,
            fullName: user.full_name,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error while trying to log in.' });
    }
});

// POST /auth/google
router.post('/google', async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ error: 'Google credential is required.' });
    }

    try {
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name: fullName, picture: avatarUrl } = payload;

        // Check if user exists
        let userQuery = await pool.query('SELECT * FROM "User" WHERE google_id = $1 OR email = $2', [googleId, email]);
        let user = userQuery.rows[0];

        if (user) {
            // Update existing user with Google info if not set
            if (!user.google_id) {
                await pool.query(
                    'UPDATE "User" SET google_id = $1, provider = $2, avatar_url = $3 WHERE id = $4',
                    [googleId, 'google', avatarUrl, user.id]
                );
            }
        } else {
            // Create new user
            const newUserQuery = await pool.query(
                'INSERT INTO "User" (full_name, email, google_id, provider, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [fullName, email, googleId, 'google', avatarUrl]
            );
            user = newUserQuery.rows[0];
        }

        // Generate JWT (same format as regular login)
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                fullName: user.full_name,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ error: 'Google authentication failed.' });
    }
});

module.exports = router;