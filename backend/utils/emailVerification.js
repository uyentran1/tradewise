const pool = require('../db');
const { sendOTPEmail } = require('./emailService');

/**
 * Simple Email Verification Utility
 * Handles 6-digit codes for registration and login verification
 */

/**
 * Generate a random 6-digit verification code
 * @returns {string} 6-digit numeric code
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification code to user's email and store in database
 * @param {number} userId - User ID
 * @param {string} email - User's email address
 * @param {string} fullName - User's full name
 * @param {string} purpose - Purpose of verification ('registration' or 'login')
 * @returns {Promise<Object>} Result with success status
 */
const sendVerificationCode = async (userId, email, fullName, purpose = 'login') => {
    try {
        const code = generateVerificationCode();
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store code in database
        await pool.query(`
            UPDATE "User" 
            SET verification_code = $1, 
                verification_expires = $2 
            WHERE id = $3
        `, [code, expiryTime, userId]);

        // Send email
        const emailResult = await sendOTPEmail(email, code, fullName, purpose);
        
        if (!emailResult.success) {
            throw new Error(emailResult.error);
        }

        console.log(`Verification code sent to ${email} for ${purpose}`);
        
        return {
            success: true,
            message: 'Verification code sent to your email',
            expiresIn: 600, // 10 minutes in seconds
            previewUrl: emailResult.previewUrl // For development
        };

    } catch (error) {
        console.error('Error sending verification code:', error);
        return {
            success: false,
            error: error.message || 'Failed to send verification code'
        };
    }
};

/**
 * Verify the code entered by user
 * @param {number} userId - User ID
 * @param {string} inputCode - Code entered by user
 * @returns {Promise<Object>} Verification result
 */
const verifyCode = async (userId, inputCode) => {
    try {
        // Clean input code
        const cleanCode = inputCode.replace(/\s/g, '');
        
        if (!/^\d{6}$/.test(cleanCode)) {
            return { isValid: false, error: 'Please enter a valid 6-digit code' };
        }

        // Get stored verification data
        const result = await pool.query(`
            SELECT verification_code, verification_expires
            FROM "User" 
            WHERE id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return { isValid: false, error: 'User not found' };
        }

        const { verification_code, verification_expires } = result.rows[0];

        // Check if code exists
        if (!verification_code) {
            return { isValid: false, error: 'No verification code found. Please request a new one.' };
        }

        // Check if code has expired
        if (new Date() > new Date(verification_expires)) {
            // Clear expired code
            await clearVerificationCode(userId);
            return { isValid: false, error: 'Verification code has expired. Please request a new one.' };
        }

        // Check if code matches
        if (cleanCode !== verification_code) {
            return { isValid: false, error: 'Invalid verification code. Please try again.' };
        }

        // Clear the verification code (verification successful)
        await pool.query(`
            UPDATE "User" 
            SET verification_code = NULL, 
                verification_expires = NULL
            WHERE id = $1
        `, [userId]);

        return { 
            isValid: true, 
            message: 'Email verified successfully'
        };

    } catch (error) {
        console.error('Error verifying code:', error);
        return { isValid: false, error: 'Internal error during verification' };
    }
};

/**
 * Clear verification code from database
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const clearVerificationCode = async (userId) => {
    try {
        await pool.query(`
            UPDATE "User" 
            SET verification_code = NULL, 
                verification_expires = NULL
            WHERE id = $1
        `, [userId]);
        return true;
    } catch (error) {
        console.error('Error clearing verification code:', error);
        return false;
    }
};


/**
 * Get verification code expiry time remaining
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Time remaining info
 */
const getVerificationTimeRemaining = async (userId) => {
    try {
        const result = await pool.query(`
            SELECT verification_expires FROM "User" WHERE id = $1
        `, [userId]);

        if (result.rows.length === 0 || !result.rows[0].verification_expires) {
            return { hasCode: false, timeRemaining: 0 };
        }

        const expiryTime = new Date(result.rows[0].verification_expires);
        const now = new Date();
        const timeRemaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

        return { 
            hasCode: true, 
            timeRemaining,
            expiresAt: expiryTime,
            isExpired: timeRemaining === 0
        };
    } catch (error) {
        console.error('Error getting verification time remaining:', error);
        return { hasCode: false, timeRemaining: 0 };
    }
};

module.exports = {
    generateVerificationCode,
    sendVerificationCode,
    verifyCode,
    clearVerificationCode,
    getVerificationTimeRemaining
};