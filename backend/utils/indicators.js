/**
 * All functions expect prices array with objects containing {datetime, close} properties
 * Prices should be sorted chronologically (oldest first)
 */

/**
 * Simple Moving Average (SMA) - SINGLE VALUE
 * 
 * Calculates: Latest SMA value only
 * Uses: Last 'period' prices from the full array
 * Returns: Single number (latest SMA value)
 * 
 * @param {Array} prices - Full price history [{datetime, close}, ...]
 * @param {number} period - Number of periods (default: 20)
 * @returns {number} Latest SMA value
 */
function calculateSMA(prices, period=20) {
    const closes = prices.slice(-period).map(p => parseFloat(p.close));
    const sum = closes.reduce((acc, val) => acc + val, 0);
    return sum / period;
}

/**
 * Relative Strength Index (RSI) - SINGLE VALUE
 * 
 * Calculates: Latest RSI value only (0-100 scale)
 * Uses: Last 'period + 1' prices from the full array (needs extra day for comparison)
 * Returns: Single number (latest RSI value)
 * 
 * @param {Array} prices - Full price history [{datetime, close}, ...]
 * @param {number} period - Number of periods (default: 14)
 * @returns {number} Latest RSI value (0-100)
 */
function calculateRSI(prices, period=14) {
    const recent = prices.slice(-period - 1); 
    let gains = 0, losses = 0;

    for (let i = 0; i < period; i++) {
        const diff = parseFloat(recent[i + 1].close) - parseFloat(recent[i].close);
        if (diff > 0) gains += diff;
        else losses -= diff; // Convert to positive
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100; // All gains, extremely overbought
    if (avgGain === 0) return 0;   // All losses, extremely oversold
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
}

/**
 * Exponential Moving Average (EMA) - ARRAY (Helper Function)
 * 
 * Calculates: Full EMA array for all valid periods
 * Uses: All prices from the full array
 * Returns: Array with EMA values starting from index (period-1)
 * 
 * @param {Array} prices - Array of price values (numbers)
 * @param {number} period - EMA period
 * @returns {Array} EMA values array (undefined for first period-1 values)
 */
function calculateEMA(prices, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for first value at index (period-1)
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += prices[i];
    }
    ema[period - 1] = sum / period;
    
    // Calculate remaining EMA values
    for (let i = period; i < prices.length; i++) {
        ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    
    return ema;
}

/**
 * Moving Average Convergence Divergence (MACD) - VALUES + ARRAYS
 * 
 * Calculates: Latest MACD values + full historical arrays
 * Uses: All prices from the full array (needs minimum 34 prices for signal)
 * Returns: Object with latest values AND full arrays for charting
 * 
 * Structure:
 * - MACD starts from index 25 (when both EMA12 and EMA26 are available)
 * - Signal starts from 9th MACD value (index 33 of original prices)
 * 
 * @param {Array} prices - Full price history [{datetime, close}, ...]
 * @returns {Object} {value, signal, histogram, macdHistory, signalHistory}
 */
function calculateMACD(prices) {
    console.log(`DEBUG: MACD calculation - prices length: ${prices.length}`);
    const closes = prices.map(p => parseFloat(p.close));
    
    // Calculate EMA arrays
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    
    // Calculate MACD line (starts from index 25 when both EMAs are available)
    const macdLine = [];
    for (let i = 25; i < closes.length; i++) {
        macdLine.push(ema12[i] - ema26[i]);
    }
    
    // Calculate signal line (9-period EMA of MACD)
    const signal = calculateEMA(macdLine, 9);
    
    console.log(`DEBUG: MACD arrays - macdLine: ${macdLine.length}, signal: ${signal.length}`);
    
    // Return latest values and full arrays
    const latestMACD = macdLine[macdLine.length - 1];
    const latestSignal = signal[signal.length - 1];
    
    // Create MACD array with datetime (starts from index 25)
    const macdArray = macdLine.map((value, index) => {
        const priceIndex = 25 + index;
        if (priceIndex >= prices.length) {
            console.warn(`MACD: Price index ${priceIndex} out of bounds (prices length: ${prices.length})`);
            return null;
        }
        return {
            datetime: prices[priceIndex].datetime,
            value: value
        };
    }).filter(item => item !== null);
    
    // Create Signal array with datetime (starts from index 33: 25 + 8)
    const signalArray = signal.map((value, index) => {
        const priceIndex = 25 + 8 + index;
        if (priceIndex >= prices.length) {
            console.warn(`MACD Signal: Price index ${priceIndex} out of bounds (prices length: ${prices.length})`);
            return null;
        }
        return {
            datetime: prices[priceIndex].datetime,
            value: value
        };
    }).filter(item => item !== null);
    
    return {
        // Latest values (for database storage)
        value: latestMACD || 0,
        signal: latestSignal || 0,
        histogram: (latestMACD || 0) - (latestSignal || 0),
        // Full arrays (for chart visualization) - now with datetime
        macdHistory: macdLine, // Keep original for backwards compatibility
        signalHistory: signal, // Keep original for backwards compatibility
        // New arrays with datetime for proper alignment
        macdArray: macdArray,
        signalArray: signalArray
    };
}

/**
 * Bollinger Bands - VALUES + ARRAY
 * 
 * Calculates: Latest BB values + full historical array of moving bands
 * Uses: All prices from the full array (rolling window calculation)
 * Returns: Object with latest values AND full array for charting
 * 
 * Structure:
 * - Each array element contains {datetime, upper, middle, lower, timestamp}
 * - Starts from index (period-1) when enough data is available
 * 
 * @param {Array} prices - Full price history [{datetime, close}, ...]
 * @param {number} period - Number of periods for calculation (default: 20)
 * @param {number} multiplier - Standard deviation multiplier (default: 2)
 * @returns {Object} {latest: {upper, lower, middle}, array: [...], upper, lower, middle}
 */
function calculateBollingerBands(prices, period=20, multiplier=2) {
    if (!prices || prices.length < period) {
        return {
            latest: null,
            array: [],
            upper: null,
            lower: null,
            middle: null
        };
    }
    
    const bollingerArray = [];
    
    // Calculate Bollinger Bands for each valid period
    for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        const closes = slice.map(p => parseFloat(p.close));
        
        // Calculate SMA for this window (middle band)
        const sma = closes.reduce((acc, val) => acc + val, 0) / period;
        
        // Calculate standard deviation
        const variance = closes.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        bollingerArray.push({
            datetime: prices[i].datetime,
            upper: sma + multiplier * stdDev,
            middle: sma,
            lower: sma - multiplier * stdDev,
            timestamp: new Date(prices[i].datetime).getTime()
        });
    }
    
    // Get latest values for database storage
    const latest = bollingerArray[bollingerArray.length - 1];
    
    return {
        // For database storage (latest values only)
        latest: {
            upper: latest.upper,
            lower: latest.lower,
            middle: latest.middle,
            datetime: latest.datetime
        },
        // For chart visualization (full moving bands)
        array: bollingerArray,
        // Convenience getters (for backwards compatibility)
        upper: latest.upper,
        lower: latest.lower,
        middle: latest.middle
    };
}

/**
 * Simple Moving Average Array - ARRAY
 * 
 * Calculates: Full SMA array for all valid periods
 * Uses: All prices from the full array (rolling window calculation)
 * Returns: Array of objects with {datetime, value} for charting
 * 
 * Structure:
 * - Each array element contains {datetime, value}
 * - Starts from index (period-1) when enough data is available
 * 
 * @param {Array} prices - Full price history [{datetime, close}, ...]
 * @param {number} period - Number of periods (default: 20)
 * @returns {Array} Array of {datetime, value} objects for charting
 */
const calculateSMAArray = (prices, period=20) => {
    if (!prices || prices.length < period) return [];
    
    const smaArray = [];
    
    // Calculate SMA for each valid period
    for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, price) => acc + parseFloat(price.close), 0);
        const smaValue = sum / period;
        
        smaArray.push({
            datetime: prices[i].datetime,
            value: smaValue
        });
    }
    
    return smaArray;
};

module.exports = {
    calculateSMA,        // Single latest SMA value
    calculateRSI,        // Single latest RSI value  
    calculateMACD,       // Latest values + full MACD/Signal arrays
    calculateBollingerBands, // Latest values + full Bollinger array
    calculateSMAArray,   // Full SMA array for charting
};