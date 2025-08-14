const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens from incoming requests
 * This protects routes that require user authentication
 */
const authenticateToken = (req, res, next) => {
    // Extract the Authorization header from the request
    // req.headers contains all HTTP headers sent by the client
    // Authorization header format: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    // Split the header by space and get the second part (the actual token)
    // authHeader.split(' ') converts "Bearer abc123token" to ["Bearer", "abc123token"]
    // [1] gets the second element (index 1) which is the token itself
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    // Verify the token using the same secret used to sign it
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        // This makes user data available to the route handler
        req.user = user; // req.user will now contain: { userId, email, fullName }
        next(); // continue to the actual route handler
    });
};

/**
 * Optional authentication middleware
 * Sets req.user if token is present and valid, but doesn't reject requests without token
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token provided, continue without authentication
        req.user = null;
        return next();
    }

    // Verify token if present
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Invalid token, but don't reject the request
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};

module.exports = { authenticateToken, optionalAuth };