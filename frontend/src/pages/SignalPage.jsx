import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import API from "../api";
import Layout from "../layouts/Layout";
import StockChart from '../components/StockChart';

const SignalPage = () => {
  const { symbol } = useParams();
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const res = await API.get(`/signals?symbol=${symbol}`);
        setSignal(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to fetch signal");
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
  }, [symbol]);

  if (loading) return <div className="text-center mt-8 text-purple-600">Loading signal...</div>;
  if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
  if (!signal) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30 min-h-screen">
        <Link
          to="/search"
          className="text-purple-600 hover:text-purple-800 hover:underline mb-4 inline-block font-medium"
        >
          &larr; Back To Search
        </Link>

        {/* Stock Info & Signal Overview */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {symbol.toUpperCase()}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold text-gray-800">
                ${signal.currentPrice.toFixed(2)}
              </p>
              {signal.priceChange && (
                <div className={`flex items-center text-lg font-medium ${signal.priceChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <span>{signal.priceChange >= 0 ? '+' : ''}${signal.priceChange.toFixed(2)}</span>
                  <span className="ml-1">
                    ({signal.priceChange >= 0 ? '+' : ''}{signal.priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
            
          </div>

          {/* Overall Signal Box */}
          <div className="border border-purple-200 rounded-xl p-4 w-full md:w-1/2 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-sm">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Overall Signal:{" "}
              <span className={`${getRecommendationColor(signal.recommendation)}`}>
                {signal.recommendation}
              </span>
            </h3>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Signal Strength:</span>
                <span className="font-semibold">{signal.score?.toFixed(1) || 'N/A'}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div 
                  className={`h-3 rounded-full ${getScoreBarColor(signal.score)}`}
                  style={{ width: `${(signal.score || 0) * 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Chart */}
        <section className="w-full bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 border border-purple-200 rounded-xl mb-8 p-6 shadow-sm">
          
          {signal.prices && signal.prices.length > 0 ? (
            <StockChart 
              ohlc={signal.prices} 
              sma={signal.smaData || []} 
              signal={signal}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Chart data unavailable</p>
            </div>
          )}
        </section>

        {/* Technical Signals */}
        <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border border-purple-200 p-6 rounded-xl mb-8 shadow-sm">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 bg-clip-text text-transparent mb-4">
            Technical Indicators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IndicatorCard
              name="RSI"
              value={signal.rsi?.toFixed(2) || 'N/A'}
              signal={getRSISignal(signal.rsi)}
              explanation={{
                title: "Relative Strength Index (RSI)",
                description: "RSI measures the speed and change of price movements on a scale of 0-100.",
                interpretation: [
                  "• RSI > 70: Potentially overbought (consider selling)",
                  "• RSI < 30: Potentially oversold (consider buying)", 
                  "• RSI 30-70: Neutral zone",
                  `• Current RSI: ${signal.rsi?.toFixed(2)} - ${getRSIInterpretation(signal.rsi)}`
                ]
              }}
            />
            
            <IndicatorCard
              name="MACD"
              value={signal.macd?.value?.toFixed(4) || 'N/A'}
              signal={getMACDSignal(signal.macd)}
              explanation={{
                title: "Moving Average Convergence Divergence (MACD)",
                description: "MACD shows the relationship between two moving averages and helps identify momentum changes.",
                interpretation: [
                  "• MACD > Signal Line: Bullish momentum",
                  "• MACD < Signal Line: Bearish momentum",
                  "• MACD crossing above zero: Potential uptrend",
                  `• Current MACD: ${signal.macd?.value?.toFixed(4)} vs Signal: ${signal.macd?.signal?.toFixed(4)}`
                ]
              }}
            />

            <IndicatorCard
              name="Simple Moving Average"
              value={signal.sma?.toFixed(2) || 'N/A'}
              signal={getSMASignal(signal.currentPrice, signal.sma)}
              explanation={{
                title: "Simple Moving Average (SMA)",
                description: "SMA smooths price data to identify trends by averaging closing prices over a specific period.",
                interpretation: [
                  "• Price > SMA: Potential uptrend",
                  "• Price < SMA: Potential downtrend",
                  "• Price near SMA: Consolidation phase",
                  `• Current Price: $${signal.currentPrice?.toFixed(2)} vs SMA: $${signal.sma?.toFixed(2)}`
                ]
              }}
            />

            <IndicatorCard
              name="Bollinger Bands"
              value={`${signal.bollinger?.upper?.toFixed(2) || 'N/A'} / ${signal.bollinger?.lower?.toFixed(2) || 'N/A'}`}
              signal={getBollingerSignal(signal.currentPrice, signal.bollinger)}
              explanation={{
                title: "Bollinger Bands",
                description: "Bollinger Bands consist of upper and lower bands around a moving average, indicating volatility and potential support/resistance levels.",
                interpretation: [
                  "• Price near Upper Band: Potentially overbought",
                  "• Price near Lower Band: Potentially oversold",
                  "• Narrow bands: Low volatility",
                  "• Wide bands: High volatility",
                  `• Current: $${signal.currentPrice?.toFixed(2)} (Upper: $${signal.bollinger?.upper?.toFixed(2)}, Lower: $${signal.bollinger?.lower?.toFixed(2)})`
                ]
              }}
            />
          </div>
        </section>

        {/* AI Analysis Summary */}
        <section className="bg-white border border-purple-200 rounded-xl p-6 text-sm text-gray-700 shadow-sm">
          <h4 className="bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 bg-clip-text text-transparent font-bold mb-3 text-lg">
            Signal Analysis Summary
          </h4>
          {signal.explanation && signal.explanation.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {signal.explanation.map((line, index) => (
                <li key={index} className="leading-relaxed">{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No detailed analysis available.</p>
          )}
        </section>
      </div>
    </Layout>
  );
};

const IndicatorCard = ({ name, value, signal, explanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const signalColors = {
    BUY: "bg-emerald-100 text-emerald-700 border-emerald-300",
    SELL: "bg-rose-100 text-rose-700 border-rose-300",
    HOLD: "bg-amber-100 text-amber-700 border-amber-300",
    NEUTRAL: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <div className="bg-white border border-purple-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-800">{name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${signalColors[signal] || signalColors.NEUTRAL}`}>
              {signal}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-800 transition-colors"
            aria-label={isExpanded ? "Collapse explanation" : "Expand explanation"}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <p className="text-lg font-mono text-gray-600">{value}</p>
      </div>

      {/* Educational Dropdown */}
      {isExpanded && (
        <div className="border-t border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4 py-3 text-sm">
          <h5 className="font-semibold text-purple-800 mb-2">{explanation.title}</h5>
          <p className="text-gray-700 mb-3">{explanation.description}</p>
          <div className="text-gray-600">
            <strong className="text-purple-700">How to interpret:</strong>
            <div className="mt-1 space-y-1">
              {explanation.interpretation.map((item, index) => (
                <div key={index} className="text-xs leading-relaxed">{item}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for signal interpretation
const getRecommendationColor = (recommendation) => {
  const colors = {
    'BUY': 'text-emerald-700',
    'STRONG_BUY': 'text-emerald-800',
    'Buy': 'text-emerald-700',
    'Strong Buy': 'text-emerald-800',
    'SELL': 'text-rose-700',
    'STRONG_SELL': 'text-rose-800',
    'Sell': 'text-rose-700',
    'Strong Sell': 'text-rose-800',
    'HOLD': 'text-amber-700',
    'Hold': 'text-amber-700',
    'NEUTRAL': 'text-gray-700'
  };
  return colors[recommendation] || 'text-gray-700';
};

const getScoreBarColor = (score) => {
  if (score >= 7) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
  if (score >= 4) return 'bg-gradient-to-r from-amber-500 to-amber-600';
  return 'bg-gradient-to-r from-rose-500 to-rose-600';
};

const getRSISignal = (rsi) => {
  if (!rsi) return 'NEUTRAL';
  if (rsi > 70) return 'SELL';
  if (rsi < 30) return 'BUY';
  return 'HOLD';
};

const getRSIInterpretation = (rsi) => {
  if (!rsi) return 'No data';
  if (rsi > 70) return 'Overbought territory';
  if (rsi < 30) return 'Oversold territory';
  return 'Neutral range';
};

const getMACDSignal = (macd) => {
  if (!macd || !macd.value || !macd.signal) return 'NEUTRAL';
  if (macd.value > macd.signal) return 'BUY';
  if (macd.value < macd.signal) return 'SELL';
  return 'HOLD';
};

const getSMASignal = (currentPrice, sma) => {
  if (!currentPrice || !sma) return 'NEUTRAL';
  const diff = ((currentPrice - sma) / sma) * 100;
  if (diff > 2) return 'BUY';
  if (diff < -2) return 'SELL';
  return 'HOLD';
};

const getBollingerSignal = (currentPrice, bollinger) => {
  if (!currentPrice || !bollinger || !bollinger.upper || !bollinger.lower) return 'NEUTRAL';
  
  const upperThreshold = bollinger.upper * 0.98; // 2% buffer
  const lowerThreshold = bollinger.lower * 1.02; // 2% buffer
  
  if (currentPrice >= upperThreshold) return 'SELL';
  if (currentPrice <= lowerThreshold) return 'BUY';
  return 'HOLD';
};

export default SignalPage;