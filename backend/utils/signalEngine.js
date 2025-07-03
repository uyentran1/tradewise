function generateRecommendation({ rsi, macd, price, sma, bollinger }) {
    // BUY conditions
    const rsiBuy = rsi < 30;
    const macdBuy = macd.value > macd.signal;
    const priceBelowLowerBand = price < bollinger.lower;

    // SELL conditions
    const rsiSell = rsi > 70;
    const macdSell = macd.value < macd.signal;
    const priceAboveUpperBand = price > bollinger.upper;

    if (rsiBuy && macdBuy && priceBelowLowerBand) {
        return 'Buy';
    }

    if (rsiSell && macdSell && priceAboveUpperBand) {
        return 'Sell';
    }

    return 'Hold';
}

module.exports = {
    generateRecommendation,
};