export function calculateSMAArray(prices, period = 20) {
  const closes = prices.map(p => parseFloat(p.close));
  const result = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null); // not enough data yet
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, val) => sum + val, 0) / period;
      result.push(avg);
    }
  }

  return result;
}

