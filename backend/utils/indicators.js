// Simple Moving Average (SMA)
function calculateSMA(prices, period=20) {
    const closes = prices.slice(0, period).map(p => parseFloat(p.close));
    const sum = closes.reduce((acc, val) => acc + val, 0);
    return sum / period;
}

// Relative Strength Index (RSI)
function calculateRSI(prices, period=14) {
    let gains = 0, losses = 0;

    for (let i = 0; i < period; i++) {
        const diff = parseFloat(prices[i].close) - parseFloat(prices[i + 1].close);
        if (diff > 0) gains += diff;
        else losses -= diff; // Convert to positive
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgGain === 0) return 100; // RSI maxed - extremely overbought → potential SELL
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// EMA (Exponential Moving Averages) helper for MACD
function calculateEMA(closes, period) {
    const k = 2 / (period + 1);
    let ema = closes[0]; // Start from the first (oldest)
    
    for (let i = 1; i < closes.length; i++) {
        ema = closes[i] * k + ema * (1 - k);
    }
    
    return ema;
}

// MACD (Moving Average Convergence Divergence) and Signal Line
function calculateMACD(prices) {
    const closes = prices.map(p => parseFloat(p.close)).reverse(); // oldest to newest

    const ema12 = calculateEMA(closes.slice(-26), 12);
    const ema26 = calculateEMA(closes.slice(-26), 26);
    const macd = ema12 - ema26;

    // Create MACD history for signal line (need full MACD series)
    const macdHistory = [];
    for (let i = 0; i <= closes.length - 26; i++) {
        const slice26 = closes.slice(i, i + 26);

        if (slice26.length < 26) continue;

        const ema12_i = calculateEMA(slice26.slice(-12), 12);
        const ema26_i = calculateEMA(slice26, 26);

        macdHistory.push(ema26_i - ema12_i);
    }

    const signal = calculateEMA(macdHistory, 9);

    return { value: macd, signal };
}

// Bollinger Bands 
function calculateBollingerBands(prices, period=20, multiplier=2) {
    const closes = prices.slice(0, period).map(p => parseFloat(p.close));
    const sma = calculateSMA(prices, period);

    const variance = closes.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
        upper: sma + multiplier * stdDev,
        lower: sma - multiplier * stdDev,
        sma,
        currentPrice: parseFloat(prices[0].close),
    };
}

module.exports = {
    calculateSMA,
    calculateRSI,
    calculateMACD,
    calculateBollingerBands,
};