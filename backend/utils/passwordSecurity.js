const zxcvbn = require('zxcvbn');

/**
 * Password Security Utility
 * Validates password strength and common security criteria
 */

/**
 * Common weak passwords to reject
 */
const COMMON_PASSWORDS = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'dragon', 'master', 'hello', 'login', 'passw0rd',
    'football', 'baseball', 'sunshine', 'iloveyou', 'trustno1', 'welcome123'
];

/**
 * Validate password against security criteria
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validatePassword = (password) => {
    const errors = [];
    const requirements = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        common: false,
        strength: false
    };

    // Check minimum length (8 characters)
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else {
        requirements.length = true;
    }

    // Check maximum length (128 characters to prevent DoS)
    if (password.length > 128) {
        errors.push('Password must be less than 128 characters long');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        requirements.uppercase = true;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        requirements.lowercase = true;
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        requirements.number = true;
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    } else {
        requirements.special = true;
    }

    // Check against common passwords
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
        errors.push('Password is too common. Please choose a more unique password');
    } else {
        requirements.common = true;
    }

    // Use zxcvbn for advanced strength checking
    const strengthAnalysis = zxcvbn(password);
    
    // Require score of at least 2 (out of 4)
    if (strengthAnalysis.score < 2) {
        errors.push(`Password is too weak. ${strengthAnalysis.feedback.warning || 'Try a longer password with mixed characters'}`);
        
        // Add specific suggestions
        if (strengthAnalysis.feedback.suggestions.length > 0) {
            errors.push(`Suggestions: ${strengthAnalysis.feedback.suggestions.join(', ')}`);
        }
    } else {
        requirements.strength = true;
    }

    // Check for personal information patterns (basic)
    if (containsPersonalInfo(password)) {
        errors.push('Password should not contain easily guessable personal information');
    }

    const isValid = errors.length === 0;
    
    return {
        isValid,
        errors,
        requirements,
        strength: {
            score: strengthAnalysis.score,
            label: getStrengthLabel(strengthAnalysis.score),
            crackTime: strengthAnalysis.crack_times_display.offline_slow_hashing_1e4_per_second,
            feedback: strengthAnalysis.feedback
        }
    };
};

/**
 * Check for basic personal information patterns
 * @param {string} password 
 * @returns {boolean}
 */
const containsPersonalInfo = (password) => {
    const lower = password.toLowerCase();
    
    // Check for common personal info patterns
    const personalPatterns = [
        /^(admin|user|guest)/,
        /(name|email|phone|address)/,
        /^(test|demo|sample)/,
        /(birthday|birth|age)/,
        /(company|work|job)/
    ];
    
    return personalPatterns.some(pattern => pattern.test(lower));
};

/**
 * Get human-readable strength label
 * @param {number} score - zxcvbn score (0-4)
 * @returns {string}
 */
const getStrengthLabel = (score) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[score] || 'Unknown';
};

/**
 * Generate password requirements text for frontend
 * @returns {Array} Array of requirement strings
 */
const getPasswordRequirements = () => {
    return [
        'At least 8 characters long',
        'Contains uppercase letter (A-Z)',
        'Contains lowercase letter (a-z)', 
        'Contains at least one number (0-9)',
        'Contains special character (!@#$%^&*)',
        'Not a common or easily guessed password',
        'Strong enough to resist attacks'
    ];
};

module.exports = {
    validatePassword,
    getPasswordRequirements,
    getStrengthLabel,
    COMMON_PASSWORDS
};