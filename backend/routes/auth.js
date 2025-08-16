const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validatePassword } = require('../utils/passwordSecurity');
const { sendVerificationCode, verifyCode } = require('../utils/emailVerification');

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
        if (userCheck.rows.length > 0) {
            const existingUser = userCheck.rows[0];
            
            // If user exists and has completed registration verification, prevent duplicate registration
            if (existingUser.registration_verified) {
                return res.status(400).json({ error: 'This email has already been registered and verified. Please login instead.' });
            }
            
            // If user exists but never completed registration verification, delete the old unverified account
            console.log(`Cleaning up unverified registration account for email: ${email}`);
            await pool.query('DELETE FROM "User" WHERE email = $1 AND registration_verified = FALSE', [email]);
        }

        // Hash the password
        const saltRounds = 12; // Increased from 10 for better security
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert into database
        const newUser = await pool.query(
            'INSERT INTO "User" (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at',
            [fullName, email, hashedPassword]
        );

        const user = newUser.rows[0];

        // Send verification email
        const verificationResult = await sendVerificationCode(user.id, email, fullName, 'registration');
        
        if (!verificationResult.success) {
            console.error('Failed to send verification email:', verificationResult.error);
            return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
        }

        // Generate temporary token for verification (10 minutes)
        const tempToken = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                fullName: user.full_name,
                tempVerification: true,
                verificationType: 'registration'
            },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        res.status(201).json({ 
            message: 'Please check your email for the verification code to complete registration.', 
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name
            },
            emailSent: verificationResult.success,
            requiresVerification: true,
            tempToken,
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

        // Block login for accounts that never completed registration verification
        if (!user.registration_verified) {
            return res.status(403).json({ 
                error: 'Account registration was never completed. Please register again to verify your email address.',
                requiresRegistration: true
            });
        }

        // Always require email verification on every login
        const verificationResult = await sendVerificationCode(user.id, user.email, user.full_name, 'login');
        
        if (!verificationResult.success) {
            return res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
        }

        // Generate temporary token for verification (10 minutes)
        const tempToken = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                fullName: user.full_name,
                tempVerification: true,
                verificationType: 'login'
            },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        return res.json({ 
            requiresVerification: true,
            tempToken,
            message: 'Please check your email for the verification code to complete login.'
        });
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

// POST /auth/verify-email
router.post('/verify-email', async (req, res) => {
    const { tempToken, verificationCode } = req.body;

    if (!tempToken || !verificationCode) {
        return res.status(400).json({ error: 'Temporary token and verification code are required' });
    }

    try {
        // Verify temporary token
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        
        if (!decoded.tempVerification) {
            return res.status(401).json({ error: 'Invalid temporary token' });
        }

        // Verify email code
        const verificationResult = await verifyCode(decoded.userId, verificationCode);
        
        if (!verificationResult.isValid) {
            return res.status(400).json({ 
                error: verificationResult.error 
            });
        }

        // If this is registration verification, mark registration as completed
        if (decoded.verificationType === 'registration') {
            await pool.query(
                'UPDATE "User" SET registration_verified = TRUE WHERE id = $1',
                [decoded.userId]
            );
            console.log(`Registration verification completed for user ${decoded.userId}`);
            
            res.json({ 
                registrationComplete: true,
                message: 'Registration completed successfully! Please log in to continue.'
            });
            return;
        }

        // Generate regular JWT token (email verified) - for login only
        const token = jwt.sign(
            { 
                userId: decoded.userId, 
                email: decoded.email,
                fullName: decoded.fullName,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.json({ 
            token, 
            user: { id: decoded.userId, email: decoded.email },
            message: 'Email verification successful'
        });

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Verification session has expired. Please log in again.' });
        }
        
        console.error('Email verification error:', err);
        res.status(500).json({ error: 'Error during email verification' });
    }
});

// POST /auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    const { tempToken } = req.body;

    if (!tempToken) {
        return res.status(400).json({ error: 'Temporary token is required' });
    }

    try {
        // Verify temporary token
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        
        if (!decoded.tempVerification) {
            return res.status(401).json({ error: 'Invalid temporary token' });
        }

        // Resend verification code with the same purpose as the original
        const purpose = decoded.verificationType || 'login';
        const verificationResult = await sendVerificationCode(decoded.userId, decoded.email, decoded.fullName, purpose);
        
        if (!verificationResult.success) {
            return res.status(500).json({ error: verificationResult.error });
        }

        res.json({ 
            message: 'Verification code sent successfully',
            emailSent: true
        });

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session has expired. Please log in again.' });
        }
        
        console.error('Resend verification error:', err);
        res.status(500).json({ error: 'Failed to resend verification code' });
    }
});

module.exports = router;