/**
 * Market Hours and Cache Duration Utilities
 * Handles US stock market trading hours and appropriate cache durations
 */

/**
 * Check if current time is during US market hours
 * US Stock Market: Monday-Friday, 9:30 AM - 4:00 PM Eastern Time
 * @returns {boolean} true if market is currently open
 */
const isMarketHours = () => {
    try {
        // Get current time in Eastern Time (where NYSE/NASDAQ operate)
        const now = new Date();
        const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        
        const dayOfWeek = easternTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const hour = easternTime.getHours();
        const minute = easternTime.getMinutes();
        const timeInMinutes = hour * 60 + minute;
        
        // Market is closed on weekends (Sunday = 0, Saturday = 6)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return false;
        }
        
        // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes) Eastern Time
        const marketOpen = 9 * 60 + 30;  // 9:30 AM = 570 minutes
        const marketClose = 16 * 60;     // 4:00 PM = 960 minutes
        
        return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
    } catch (error) {
        console.error('Error checking market hours:', error);
        // If there's an error, assume market is closed for safety (longer cache)
        return false;
    }
};

/**
 * Get appropriate cache duration in minutes based on market status
 * Hybrid approach: Shorter cache during market hours, longer when closed
 * @returns {number} cache duration in minutes
 */
const getCacheDurationMinutes = () => {
    if (isMarketHours()) {
        // During market hours: 15 minutes for fresher data
        return 15;
    } else {
        // After market hours/weekends: 60 minutes (prices don't change much)
        return 60;
    }
};

/**
 * Get cache duration for database queries (PostgreSQL interval format)
 * @returns {string} PostgreSQL interval string
 */
const getCacheDurationInterval = () => {
    const minutes = getCacheDurationMinutes();
    return `${minutes} minutes`;
};

/**
 * Check if we're in pre-market or after-hours trading
 * Pre-market: 4:00 AM - 9:30 AM ET
 * After-hours: 4:00 PM - 8:00 PM ET
 * @returns {string} 'market', 'pre-market', 'after-hours', or 'closed'
 */
const getMarketStatus = () => {
    try {
        const now = new Date();
        const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        
        const dayOfWeek = easternTime.getDay();
        const hour = easternTime.getHours();
        const minute = easternTime.getMinutes();
        const timeInMinutes = hour * 60 + minute;
        
        // Weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 'closed';
        }
        
        const preMarketStart = 4 * 60;      // 4:00 AM
        const marketOpen = 9 * 60 + 30;     // 9:30 AM
        const marketClose = 16 * 60;        // 4:00 PM
        const afterHoursEnd = 20 * 60;      // 8:00 PM
        
        if (timeInMinutes >= marketOpen && timeInMinutes < marketClose) {
            return 'market';
        } else if (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
            return 'pre-market';
        } else if (timeInMinutes >= marketClose && timeInMinutes < afterHoursEnd) {
            return 'after-hours';
        } else {
            return 'closed';
        }
    } catch (error) {
        console.error('Error getting market status:', error);
        return 'closed';
    }
};

/**
 * Log current market status for debugging
 */
const logMarketStatus = () => {
    const status = getMarketStatus();
    const cacheDuration = getCacheDurationMinutes();
    const easternTime = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    
    console.log(`Market Status: ${status} | Cache: ${cacheDuration}min | ET: ${easternTime}`);
};

module.exports = {
    isMarketHours,
    getCacheDurationMinutes,
    getCacheDurationInterval,
    getMarketStatus,
    logMarketStatus
};