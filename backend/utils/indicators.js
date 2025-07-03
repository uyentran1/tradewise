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
        else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgGain === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// EMA (Exponential Moving Averages) helper for MACD
function calculateEMA(closes, period) {
    const k = 2 / (period + 1);
    let ema = closes[0];
    
    for (let i = 0; i < closes.length; i++) {
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

    // To calculate signal line (EMA 9 of MACD values over time), will need historical MACD values
    // For now, approximate:
    const signal = macd * 0.8;

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