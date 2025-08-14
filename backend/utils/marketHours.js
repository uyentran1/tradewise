/**
 * Market Hours and Cache Duration Utilities
 * Handles multiple stock market trading hours and appropriate cache durations
 */

const pool = require('../db');

/**
 * List of UK exchanges
 */
const UK_EXCHANGES = [
    'LSE', 'London Stock Exchange', 'LON', 'LDN', 
    'AIM', 'Alternative Investment Market',
    'ISDX', 'ICAP Securities & Derivatives Exchange',
    'NEX', 'NEX Exchange'
];

/**
 * Market configuration for different exchanges
 */
const MARKET_CONFIG = {
    US: {
        timezone: 'America/New_York',
        openHour: 9,
        openMinute: 30,
        closeHour: 16,
        closeMinute: 0,
        name: 'US Markets (NYSE/NASDAQ)'
    },
    UK: {
        timezone: 'Europe/London',
        openHour: 8,
        openMinute: 0,
        closeHour: 16,
        closeMinute: 30,
        name: 'London Stock Exchange'
    }
};

/**
 * Detect market from exchange name
 * @param {string} exchange - Exchange name (e.g., "LSE", "NYSE", "NASDAQ")
 * @returns {string} Market identifier ('US', 'UK')
 */
const detectMarketFromExchange = (exchange) => {
    if (!exchange) return 'US';
    
    // Check if exchange is in UK list (case insensitive)
    const isUKExchange = UK_EXCHANGES.some(ukExchange => 
        exchange.toUpperCase().includes(ukExchange.toUpperCase()) ||
        ukExchange.toUpperCase().includes(exchange.toUpperCase())
    );
    
    return isUKExchange ? 'UK' : 'US';
};

/**
 * Detect market from stock symbol by checking database first, then fallback to suffix detection
 * @param {string} symbol - Stock symbol (e.g., "AAPL", "LLOY.L", "TSCO.L")
 * @returns {Promise<string>} Market identifier ('US', 'UK')
 */
const detectMarketFromSymbol = async (symbol) => {
    if (!symbol) return 'US';
    
    try {
        // First try to get market from database
        const result = await pool.query(
            'SELECT market FROM "Stock" WHERE symbol = $1',
            [symbol]
        );
        
        if (result.rows[0]?.market) {
            return result.rows[0].market;
        }
        
        // Fallback to suffix detection for new stocks
        if (symbol.endsWith('.L')) {
            return 'UK';
        }
        
        return 'US';
    } catch (err) {
        console.warn('Failed to fetch market for symbol:', symbol, err.message);
        
        // Fallback to suffix detection if database fails
        if (symbol.endsWith('.L')) {
            return 'UK';
        }
        return 'US';
    }
};

/**
 * Check if current time is during market hours for a specific market
 * @param {string} market - Market identifier ('US' or 'UK')
 * @returns {boolean} true if market is currently open
 */
const isMarketHours = (market = 'US') => {
    try {
        const config = MARKET_CONFIG[market];
        if (!config) {
            console.warn(`Unknown market: ${market}, defaulting to US`);
            return isMarketHours('US');
        }

        // Get current time in the market's timezone
        const now = new Date();
        const marketTime = new Date(now.toLocaleString("en-US", {timeZone: config.timezone}));
        
        const dayOfWeek = marketTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const hour = marketTime.getHours();
        const minute = marketTime.getMinutes();
        const timeInMinutes = hour * 60 + minute;
        
        // Market is closed on weekends (Sunday = 0, Saturday = 6)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return false;
        }
        
        // Calculate market open/close times in minutes
        const marketOpen = config.openHour * 60 + config.openMinute;
        const marketClose = config.closeHour * 60 + config.closeMinute;
        
        return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
    } catch (error) {
        console.error(`Error checking ${market} market hours:`, error);
        // If there's an error, assume market is closed for safety (longer cache)
        return false;
    }
};

/**
 * Get appropriate cache duration in minutes based on market status
 * Hybrid approach: Shorter cache during market hours, longer when closed
 * @param {string} symbol - Stock symbol to determine market
 * @returns {Promise<number>} cache duration in minutes
 */
const getCacheDurationMinutes = async (symbol) => {
    const market = await detectMarketFromSymbol(symbol);
    
    if (isMarketHours(market)) {
        // During market hours: 15 minutes for fresher data
        return 15;
    } else {
        // After market hours/weekends: 60 minutes (prices don't change much)
        return 60;
    }
};

/**
 * Get cache duration for database queries (PostgreSQL interval format)
 * @param {string} symbol - Stock symbol to determine market
 * @returns {Promise<string>} PostgreSQL interval string
 */
const getCacheDurationInterval = async (symbol) => {
    const minutes = await getCacheDurationMinutes(symbol);
    return `${minutes} minutes`;
};

/**
 * Check market status for a specific market
 * @param {string} symbol - Stock symbol to determine market
 * @returns {Promise<string>} 'market', 'pre-market', 'after-hours', or 'closed'
 */
const getMarketStatus = async (symbol) => {
    const market = await detectMarketFromSymbol(symbol);
    
    try {
        const config = MARKET_CONFIG[market];
        if (!config) {
            console.warn(`Unknown market: ${market}, defaulting to US`);
            return getMarketStatus('AAPL'); // Default US stock
        }

        const now = new Date();
        const marketTime = new Date(now.toLocaleString("en-US", {timeZone: config.timezone}));
        
        const dayOfWeek = marketTime.getDay();
        const hour = marketTime.getHours();
        const minute = marketTime.getMinutes();
        const timeInMinutes = hour * 60 + minute;
        
        // Weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 'closed';
        }
        
        const marketOpen = config.openHour * 60 + config.openMinute;
        const marketClose = config.closeHour * 60 + config.closeMinute;
        
        // For extended hours, use different logic per market
        let preMarketStart, afterHoursEnd;
        
        if (market === 'US') {
            preMarketStart = 4 * 60;      // 4:00 AM ET
            afterHoursEnd = 20 * 60;      // 8:00 PM ET
        } else if (market === 'UK') {
            preMarketStart = 7 * 60;      // 7:00 AM GMT (1 hour before open)
            afterHoursEnd = 17 * 60 + 30; // 5:30 PM GMT (1 hour after close)
        }
        
        if (timeInMinutes >= marketOpen && timeInMinutes < marketClose) {
            return 'market';
        } else if (preMarketStart && timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
            return 'pre-market';
        } else if (afterHoursEnd && timeInMinutes >= marketClose && timeInMinutes < afterHoursEnd) {
            return 'after-hours';
        } else {
            return 'closed';
        }
    } catch (error) {
        console.error(`Error getting ${market} market status:`, error);
        return 'closed';
    }
};

/**
 * Log current market status for debugging
 * @param {string} symbol - Stock symbol to check market status
 */
const logMarketStatus = async (symbol) => {
    const market = await detectMarketFromSymbol(symbol);
    const status = await getMarketStatus(symbol);
    const cacheDuration = await getCacheDurationMinutes(symbol);
    const config = MARKET_CONFIG[market];
    
    const marketTime = new Date().toLocaleString("en-US", {
        timeZone: config.timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    
    console.log(`${symbol} (${config.name}) | Status: ${status} | Cache: ${cacheDuration}min | Time: ${marketTime}`);
};

module.exports = {
    detectMarketFromSymbol,
    detectMarketFromExchange,
    isMarketHours,
    getCacheDurationMinutes,
    getCacheDurationInterval,
    getMarketStatus,
    logMarketStatus,
    MARKET_CONFIG,
    UK_EXCHANGES
};