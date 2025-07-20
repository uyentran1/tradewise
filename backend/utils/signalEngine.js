function generateRecommendation({ rsi, macd, currentPrice, sma, bollinger, weights = { macd: 3, rsi: 2, sma: 1.5, bollinger: 1 }}) {
    let score = 0;
    const reasons = [];

    // RSI
    if (rsi < 35) {
        score += weights.rsi;
        reasons.push("RSI is below 35, indicating the stock may be oversold.");
    } else if (rsi > 65) {
        score -= weights.rsi;
        reasons.push("RSI is above 65, indicating the stock may be overbought.");
    }

    // MACD
    if (macd.value > macd.signal) {
        score += weights.macd;
        reasons.push("MACD is above its signal line, suggesting bullish momentum.");
    } else if (macd.value < macd.signal) {
        score -= weights.macd;
        reasons.push("MACD is below its signal line, suggesting bearish momentum.");
    }

    // SMA
    if (currentPrice > sma) {
        score += weights.sma;
        reasons.push("Price is above the 20-day SMA, indicating an uptrend.");
    } else if (currentPrice < sma) {
        score -= weights.sma;
        reasons.push("Price is below the 20-day SMA, indicating a downtrend.");
    }

    // Bollinger Bands
    if (currentPrice < bollinger.lower) {
        score += weights.bollinger;
        reasons.push("Price is below the lower Bollinger Band, suggesting a possible bounce.");
    } else if (currentPrice > bollinger.upper) {
        score -= weights.bollinger;
        reasons.push("Price is above the upper Bollinger Band, suggesting it may be due for a pullback.");
    }

    // Decision thresholds
    if (score >= 5) return { score, recommendation: "Strong Buy", explanation: reasons };
    if (score >= 3) return { score, recommendation: "Buy", explanation: reasons };
    if (score <= -5) return { score, recommendation: "Strong Sell", explanation: reasons };
    if (score <= -3) return { score, recommendation: "Sell", explanation: reasons };

    reasons.push("The indicators do not strongly support a Buy or Sell decision. Holding may be the safest action.");
    return { score, recommendation: "Hold", explanation: reasons };
}

module.exports = {
    generateRecommendation,
};