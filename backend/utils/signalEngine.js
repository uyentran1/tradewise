function generateRecommendation({ rsi, macd, price, sma, bollinger }) {
    const reasons = [];
    
    // BUY conditions
    const rsiBuy = rsi < 30;
    const macdBuy = macd.value > macd.signal;
    const priceBelowLowerBand = price < bollinger.lower;

    // SELL conditions
    const rsiSell = rsi > 70;
    const macdSell = macd.value < macd.signal;
    const priceAboveUpperBand = price > bollinger.upper;

    if (rsiBuy && macdBuy && priceBelowLowerBand) {
        if (rsiBuy) reasons.push("RSI is below 30, indicating the stock may be oversold.");
        if (macdBuy) reasons.push("MACD is above its signal line, suggesting bullish momentum.");
        if (priceBelowLowerBand) reasons.push("Price is below the lower Bollinger Band, suggesting a possible bounce.");
        return {recommendation: 'Buy', explanation: reasons};
    }

    if (rsiSell && macdSell && priceAboveUpperBand) {
        if (rsiSell) reasons.push("RSI is above 70, indicating the stock may be overbought.");
        if (macdSell) reasons.push("MACD is below its signal line, suggesting bearish momentum.");
        if (priceAboveUpperBand) reasons.push("Price is above the upper Bollinger Band, suggesting it may be due for a pullback.");
        return { recommendation: 'Sell', explanation: reasons };
    }

    reasons.push("The indicators do not strongly support a Buy or Sell decision. Holding may be the safest action.");
    return { recommendation: 'Hold', explanation: reasons };
}

module.exports = {
    generateRecommendation,
};