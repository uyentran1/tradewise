const WEIGHTS = {
  macd: 3,      // both momentum and trend predictor 
  rsi: 2,       // reliable for extremes
  bollinger: 2, // good volatility breakout predictor
  sma: 1,       // basic trend
};

const maxScoreAbs = Object.values(WEIGHTS).reduce((acc, w) => acc + w, 0);

const THRESHOLDS = {
  rsi: {
    oversold: 30,        // Wilder's original threshold
    oversoldWeak: 35,    // for early signals
    overbought: 70,      // Wilder's original threshold
    overboughtWeak: 65   // for early signals
  },
  smaDeviation: 0.02,       // 2% deviation threshold for significance
  macdSignificance: 0.001,  // 0.1% of price for meaningful signal
  bollingerProximity: 0.03  // 3% from bands for "near" signals
};

let score = 0;
let reasons = [];
let strongSignalCount = 0;
let contributions = {};

// SMA Analysis with percentage deviation
function analyseSMA(sma, currentPrice) {
    const smaDeviation = ((currentPrice - sma) / sma) * 100;
    const deviationThreshold = THRESHOLDS.smaDeviation * 100;
    
    if (Math.abs(smaDeviation) >= deviationThreshold) {
        if (currentPrice > sma) {
            score += WEIGHTS.sma;
            strongSignalCount++;
            contributions.SMA = { contribution: WEIGHTS.sma, weight: WEIGHTS.sma, strength: 1.0 };
            reasons.push(`Price is above SMA: ${currentPrice.toFixed(1)} vs ${sma.toFixed(1)} by ${smaDeviation.toFixed(0)}% → uptrend.`);
        } else {
            score -= WEIGHTS.sma;
            strongSignalCount++;
            contributions.SMA = { contribution: -WEIGHTS.sma, weight: WEIGHTS.sma, strength: 1.0 };
            reasons.push(`Price is below SMA: ${currentPrice.toFixed(1)} vs ${sma.toFixed(1)} by ${smaDeviation.toFixed(0)}% → downtrend.`);
        }
    } else {
        contributions.SMA = { contribution: 0, weight: WEIGHTS.sma, strength: 0 };
        const direction = currentPrice > sma ? "above" : "below";
        reasons.push(`Price is ${direction} but too near SMA: ${currentPrice.toFixed(1)} vs ${sma.toFixed(1)} (within ${deviationThreshold}% threshold) → sideways trend.`);
    }
}

// RSI Analysis
function analyseRSI(rsi) {
    const rsiVal = rsi.toFixed(0);

    if (rsi <= THRESHOLDS.rsi.oversold) {
        const contribution = WEIGHTS.rsi;
        score += contribution;
        strongSignalCount++;
        contributions.RSI = { contribution, weight: WEIGHTS.rsi, strength: 1.0 };
        reasons.push(`RSI severely oversold: ${rsiVal} ≤ ${THRESHOLDS.rsi.oversold} threshold → strong bullish signal.`);
    } else if (rsi <= THRESHOLDS.rsi.oversoldWeak) {
        const contribution = WEIGHTS.rsi * 0.7;
        score += contribution;
        contributions.RSI = { contribution, weight: WEIGHTS.rsi, strength: 0.7 };
        reasons.push(`RSI oversold: ${rsiVal} ≤ ${THRESHOLDS.rsi.oversoldWeak} threshold → moderate bullish signal.`);
    } else if (rsi >= THRESHOLDS.rsi.overbought) {
        const contribution = -WEIGHTS.rsi;
        score += contribution;
        strongSignalCount++;
        contributions.RSI = { contribution, weight: WEIGHTS.rsi, strength: 1.0 };
        reasons.push(`RSI severely overbought: ${rsiVal} ≥ ${THRESHOLDS.rsi.overbought} threshold → strong bearish signal.`);
    } else if (rsi >= THRESHOLDS.rsi.overboughtWeak) {
        const contribution = -WEIGHTS.rsi * 0.7;
        score += contribution;
        contributions.RSI = { contribution, weight: WEIGHTS.rsi, strength: 0.7 };
        reasons.push(`RSI overbought: ${rsiVal} ≥ ${THRESHOLDS.rsi.overboughtWeak} threshold → moderate bearish signal.`);
    } else {
        contributions.RSI = { contribution: 0, weight: WEIGHTS.rsi, strength: 0 };
        reasons.push(`RSI neutral: ${rsiVal} between ${THRESHOLDS.rsi.oversoldWeak}-${THRESHOLDS.rsi.overboughtWeak} range → no clear signal.`);
    }
}

// MACD Analysis: use percentage-based significance
function analyseMACD(macd, currentPrice) {
    const macdDifference = macd.value - macd.signal;
    const macdPercentage = (macdDifference / currentPrice) * 100;
    const significanceThreshold = THRESHOLDS.macdSignificance * 100;

    if (Math.abs(macdPercentage) >= significanceThreshold) {
        if (macd.value > macd.signal) {
            const contribution = WEIGHTS.macd;
            score += contribution;
            strongSignalCount++;
            contributions.MACD = { contribution, weight: WEIGHTS.macd, strength: 1.0 };
            reasons.push(`MACD bullish crossover: ${macd.value.toFixed(1)} > ${macd.signal.toFixed(1)} (over ${significanceThreshold.toFixed(1)}% threshold) → strong momentum up.`);
        } else {
            const contribution = -WEIGHTS.macd;
            score += contribution;
            strongSignalCount++;
            contributions.MACD = { contribution, weight: WEIGHTS.macd, strength: 1.0 };
            reasons.push(`MACD bearish crossover: ${macd.value.toFixed(1)} < ${macd.signal.toFixed(1)} (over ${significanceThreshold.toFixed(1)}% threshold) → strong momentum down.`);
        }
    } else {
        contributions.MACD = { contribution: 0, weight: WEIGHTS.macd, strength: 0 };
        const direction = macd.value > macd.signal ? "above" : "below";
        reasons.push(`MACD weak signal: ${macd.value.toFixed(1)} ${direction} ${macd.signal.toFixed(1)} (within ${significanceThreshold.toFixed(1)}% threshold) → insufficient momentum.`);
    }
}

// Bollinger Bands Analysis with proximity detection
function analyseBollingerBands(bollinger, currentPrice) {
    const bandWidth = bollinger.upper - bollinger.lower;
    const proximityThreshold = THRESHOLDS.bollingerProximity;
    
    if (currentPrice <= bollinger.lower) {
        const contribution = WEIGHTS.bollinger;
        score += contribution;
        strongSignalCount++;
        contributions.Bollinger = { contribution, weight: WEIGHTS.bollinger, strength: 1.0 };
        const belowAmount = ((bollinger.lower - currentPrice) / currentPrice) * 100;
        reasons.push(`Price below lower BB: ${currentPrice.toFixed(1)} ≤ ${bollinger.lower.toFixed(1)} (-${belowAmount.toFixed(0)}% breach) → oversold, rebound likely.`);
    } else if (currentPrice >= bollinger.upper) {
        const contribution = -WEIGHTS.bollinger;
        score += contribution;
        strongSignalCount++;
        contributions.Bollinger = { contribution, weight: WEIGHTS.bollinger, strength: 1.0 };
        const aboveAmount = ((currentPrice - bollinger.upper) / currentPrice) * 100;
        reasons.push(`Price above upper BB: ${currentPrice.toFixed(1)} ≥ ${bollinger.upper.toFixed(1)} (+${aboveAmount.toFixed(0)}% breach) → overbought, pullback likely.`);
    } else {
        // Check proximity to bands
        const lowerDistance = (currentPrice - bollinger.lower) / currentPrice;
        const upperDistance = (bollinger.upper - currentPrice) / currentPrice;
        
        if (lowerDistance <= proximityThreshold) {
            const contribution = WEIGHTS.bollinger * 0.5;
            score += contribution;
            contributions.Bollinger = { contribution, weight: WEIGHTS.bollinger, strength: 0.5 };
            const distancePercent = lowerDistance * 100;
            reasons.push(`Price near lower BB: ${currentPrice.toFixed(1)} vs ${bollinger.lower.toFixed(1)} (within ${(proximityThreshold * 100).toFixed(0)}% threshold) → potential bounce zone.`);
        } else if (upperDistance <= proximityThreshold) {
            const contribution = -WEIGHTS.bollinger * 0.5;
            score += contribution;
            contributions.Bollinger = { contribution, weight: WEIGHTS.bollinger, strength: 0.5 };
            const distancePercent = upperDistance * 100;
            reasons.push(`Price near upper BB: ${currentPrice.toFixed(1)} vs ${bollinger.upper.toFixed(1)} (within ${(proximityThreshold * 100).toFixed(0)}% threshold) → potential resistance zone.`);
        } else {
            contributions.Bollinger = { contribution: 0, weight: WEIGHTS.bollinger, strength: 0 };
            const positionPercent = ((currentPrice - bollinger.lower) / bandWidth) * 100;
            reasons.push(`Price within BB range: ${currentPrice.toFixed(1)} between ${bollinger.lower.toFixed(1)}-${bollinger.upper.toFixed(1)} (${positionPercent.toFixed(0)}% position) → normal volatility.`);
        }
    }
}


function generateRecommendation(indicators) {

    const { rsi, macd, currentPrice, sma, bollinger } = indicators;

    analyseSMA(sma, currentPrice);
    analyseRSI(rsi);
    analyseMACD(macd, currentPrice);
    analyseBollingerBands(bollinger, currentPrice);

    const absScore = Math.abs(score);
    const confidence = absScore / maxScoreAbs;

    let recommendation;
    if (confidence >= 0.8) {
        recommendation = score > 0 ? "Strong Buy" : "Strong Sell";
    } else if (confidence >= 0.6) {
        recommendation = score > 0 ? "Moderate Buy" : "Moderate Sell";
    } else if (confidence >= 0.4) {
        recommendation = score > 0 ? "Weak Buy" : "Weak Sell";
    } else {
        recommendation = "Hold";
    }

    // Add summary reason with specific score breakdown
    const scoreBreakdown = `Final score: ${score.toFixed(1)}/${maxScoreAbs.toFixed(0)} (${(confidence * 100).toFixed(0)}% confidence)`;
    reasons.push(scoreBreakdown);

    return {
        score: parseFloat(score.toFixed(2)),
        confidence: parseFloat((confidence * 100).toFixed(1)),
        recommendation,
        explanation: reasons,
        contributions,
        components: {
            maxPossibleScore: maxScoreAbs,
            signalStrength: strongSignalCount,
            weightDistribution: WEIGHTS
        }
    };
}

module.exports = { generateRecommendation };