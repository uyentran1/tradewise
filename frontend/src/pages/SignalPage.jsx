import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { InformationCircleIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon } from "@heroicons/react/24/solid";
import API from "../api";
import Layout from "../layouts/Layout";
import StockChart from '../components/StockChart';
import IndicatorCard from '../components/IndicatorCard';
import { AuthContext } from '../context/AuthContext';

const SignalPage = () => {
  const { symbol } = useParams();
  const { user } = useContext(AuthContext); // Get user authentication state
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for save signal functionality
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  
  // States for watchlist functionality  
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

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

  // Check if symbol is in watchlist when user is logged in
  useEffect(() => {
    const checkWatchlist = async () => {
      if (user && symbol) {
        try {
          const res = await API.get(`/watchlist/check/${symbol}`);
          setInWatchlist(res.data.inWatchlist);
        } catch (err) {
          console.error('Error checking watchlist:', err);
        }
      }
    };
    checkWatchlist();
  }, [user, symbol]);

  // Function to save signal for future review
  const handleSaveSignal = async () => {
    if (!user) {
      alert('Please log in to save signals');
      return;
    }

    setIsSaving(true);
    try {
      await API.post('/saved-signals', {
        symbol,
        signalData: signal, // Save complete signal data
        notes: notes.trim() || null
      });
      
      setSaveSuccess(true);
      setNotes(''); // Clear notes after successful save
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving signal:', err);
      alert('Failed to save signal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to toggle watchlist status
  const handleWatchlistToggle = async () => {
    if (!user) {
      alert('Please log in to use watchlist');
      return;
    }

    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        // Remove from watchlist
        await API.delete(`/watchlist/${symbol}`);
        setInWatchlist(false);
      } else {
        // Add to watchlist
        await API.post('/watchlist', { symbol });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setWatchlistLoading(false);
    }
  };


  if (loading) return (
    <Layout>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Analysing {symbol?.toUpperCase()}...</p>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Analysis Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );

  if (!signal) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
          
          {/* Stock Header */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              
              {/* Stock Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-5xl font-bold text-slate-800">
                    {symbol.toUpperCase()}
                  </h1>
                  <div className="px-3 py-1 bg-slate-100 rounded-full">
                    <span className="text-sm text-slate-600 font-medium">{signal.companyName}</span>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-6">
                  
                  {signal.priceChange !== undefined && (
                    <div className={`flex items-center text-xl font-semibold ${
                      signal.priceChange >= 0 
                        ? 'text-emerald-600' 
                        : 'text-red-600'
                    }`}>
                      <span className={`text-4xl font-bold ${signal.priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="currentColor">
                        ${signal.currentPrice.toFixed(2)}
                      </span>

                      <svg className={`w-5 h-5 mr-1 ${signal.priceChange >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{signal.priceChange >= 0 ? '+' : ''}${signal.priceChange.toFixed(2)}</span>
                      <span className="ml-2">
                        ({signal.priceChange >= 0 ? '+' : ''}{signal.priceChangePercent.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signal Summary Card */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-6 min-w-80">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4">Trading Signal</h3>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-xl font-bold ${getRecommendationStyle(signal.recommendation)}`}>
                    <span className="ml-2">{signal.recommendation}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${getScoreBarColor(signal.score)}`}
                      style={{ width: `${Math.min((Math.abs(signal.score || 0) / (signal.components?.maxPossibleScore || 8.5)) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Trade Confidence</span>
                    <span className={`font-semibold ${getConfidenceColor(signal.confidence)}`}>
                      {signal.confidence}%
                    </span>
                  </div>

                  {/* Signal Score */}
                  {/* <div className="flex justify-between items-center">
                    <span className="text-slate-600">Signal Score</span>
                    <span className="font-bold text-slate-800">{Math.abs(signal.score || 0).toFixed(1)}/{signal.components?.maxPossibleScore?.toFixed(0) || '8.5'}</span>
                  </div> */}

                </div>
              </div>
            </div>

            {/* Action Buttons - Only show if user is logged in */}
            {user && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {/* Save Signal Section */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BookmarkIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-800">Save Signal</h3>
                  </div>
                  
                  {/* Notes input */}
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this signal (optional)..."
                    className="w-full p-3 border border-slate-300 rounded-lg resize-none text-sm mb-3"
                    rows="2"
                  />
                  
                  <button
                    onClick={handleSaveSignal}
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <BookmarkIcon className="w-4 h-4" />
                        Save for Review
                      </>
                    )}
                  </button>
                  
                  {/* Success message */}
                  {saveSuccess && (
                    <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-lg text-sm flex items-center gap-2">
                      <BookmarkSolidIcon className="w-4 h-4" />
                      Signal saved successfully!
                    </div>
                  )}
                </div>

                {/* Watchlist Section */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <HeartIcon className={`w-5 h-5 ${inWatchlist ? 'text-red-600' : 'text-slate-400'}`} />
                    <h3 className="font-semibold text-slate-800">Watchlist</h3>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-3">
                    {inWatchlist ? 'This stock is in your watchlist' : 'Monitor this stock regularly'}
                  </p>
                  
                  <button
                    onClick={handleWatchlistToggle}
                    disabled={watchlistLoading}
                    className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      inWatchlist
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-slate-600 text-white hover:bg-slate-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {watchlistLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <HeartIcon className="w-4 h-4" />
                        {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800">Price Chart & Technical Analysis</h2>
            </div>
            <div className="p-6">
              {signal.prices && signal.prices.length > 0 ? (
                <StockChart 
                  ohlc={signal.prices} 
                  sma={signal.smaData || []} 
                  signal={signal}
                />
              ) : (
                <div className="text-center text-slate-500 py-16">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-lg">Chart data unavailable</p>
                </div>
              )}
            </div>
          </div>

          {/* Technical Indicators Grid */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-8">
            <div className="border-b border-slate-200 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Technical Indicators</h2>
                {signal.components?.signalStrength !== undefined && (
                  <div className="text-sm text-slate-600">
                    Strong Signals: {signal.components.signalStrength}/4 indicators
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IndicatorCard
                  name="SMA"
                  value={signal.sma?.toFixed(1) || 'N/A'}
                  signal={getSMASignal(signal.currentPrice, signal.sma)}
                  contribution={signal.contributions?.SMA}
                  explanation={{
                    title: "Simple Moving Average (SMA)",
                    description: "SMA smooths price data to identify trends by averaging closing prices over a specific period.",
                    interpretation: [
                      "• Price > SMA: Potential uptrend",
                      "• Price < SMA: Potential downtrend",
                      "• Price near SMA: Consolidation phase",
                      `• Current Price: ${signal.currentPrice?.toFixed(2)} vs SMA: ${signal.sma?.toFixed(2)}`
                    ]
                  }}
                />
                
                <IndicatorCard
                  name="RSI"
                  value={signal.rsi?.toFixed(0) || 'N/A'}
                  signal={getRSISignal(signal.rsi)}
                  contribution={signal.contributions?.RSI}
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
                  contribution={signal.contributions?.MACD}
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
                  name="Bollinger Bands"
                  value={`${signal.bollinger?.lower?.toFixed(2) || 'N/A'} - ${signal.bollinger?.upper?.toFixed(2) || 'N/A'}`}
                  signal={getBollingerSignal(signal.currentPrice, signal.bollinger)}
                  contribution={signal.contributions?.Bollinger}
                  explanation={{
                    title: "Bollinger Bands",
                    description: "Bollinger Bands consist of upper and lower bands around a moving average, indicating volatility and potential support/resistance levels.",
                    interpretation: [
                      "• Price near Upper Band: Potentially overbought",
                      "• Price near Lower Band: Potentially oversold",
                      "• Narrow bands: Low volatility",
                      "• Wide bands: High volatility",
                      `• Current: ${signal.currentPrice?.toFixed(1)} (Upper: ${signal.bollinger?.upper?.toFixed(1)}, Lower: ${signal.bollinger?.lower?.toFixed(2)})`
                    ]
                  }}
                />
              </div>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800">Signal Analysis Summary</h2>
            </div>
            <div className="p-6">
              {signal.explanation && signal.explanation.length > 0 ? (
                <div className="space-y-3">
                  {signal.explanation.map((line, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-slate-700 leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No detailed analysis available.</p>
              )}

              {/* Signal Contributions Breakdown */}
              {signal.contributions && Object.keys(signal.contributions).length > 0 && (
                <div className="mt-8 p-6 bg-slate-50 rounded-xl">
                  <h3 className="font-bold text-slate-800 mb-4">Signal Contribution Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(signal.contributions).map(([indicator, data]) => (
                      <div key={indicator} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-700">{indicator}</span>
                        <div className="text-right">
                          <div className={`font-bold ${data.contribution >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {data.contribution >= 0 ? '+' : ''}{data.contribution.toFixed(2)} pts
                          </div>
                          <div className="text-xs text-slate-500">
                            {data.weight.toFixed(1)}w × {data.strength.toFixed(2)}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight Distribution */}
              {signal.components?.weightDistribution && (
                <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-10 pb-6">Indicator Weight Distribution to Total Score:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(signal.components.weightDistribution).map(([indicator, weight]) => (
                      <div key={indicator} className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <div className="text-md font-bold text-blue-800 uppercase">{indicator}</div>
                        <div className="text-md text-blue-600">{weight}</div>
                        {indicator === "sma" && <p className="text-sm text-blue-800 pt-2">Basic trend indicator</p>}
                        {indicator === "rsi" && <p className="text-sm text-blue-800 pt-2">Reliable for extreme price ranges</p>}
                        {indicator === "macd" && <p className="text-sm text-blue-800 pt-2">Both momentum and trend predictor</p>}
                        {indicator === "bollinger" && <p className="text-sm text-blue-800 pt-2">Good volatility breakout predictor</p>}               
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Helper functions for styling
const getRecommendationStyle = (recommendation) => {
  const styles = {
    'BUY': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'Buy': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'Strong Buy': 'bg-emerald-200 text-emerald-800 border-emerald-400',
    'Moderate Buy': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'Weak Buy': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'SELL': 'bg-red-100 text-red-700 border-red-300',
    'Sell': 'bg-red-100 text-red-700 border-red-300',
    'Strong Sell': 'bg-red-200 text-red-800 border-red-400',
    'Moderate Sell': 'bg-red-100 text-red-700 border-red-300',
    'Weak Sell': 'bg-red-50 text-red-600 border-red-200',
    'HOLD': 'bg-amber-100 text-amber-700 border-amber-300',
    'Hold': 'bg-amber-100 text-amber-700 border-amber-300',
  };
  return styles[recommendation] || 'bg-slate-100 text-slate-700 border-slate-300';
};

const getSignalIcon = (recommendation) => {
  if (recommendation?.includes('Buy') || recommendation === 'BUY') {
    return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
  }
  if (recommendation?.includes('Sell') || recommendation === 'SELL') {
    return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
  }
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
};

const getScoreBarColor = (score) => {
  if (Math.abs(score) >= 6) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
  if (Math.abs(score) >= 3) return 'bg-gradient-to-r from-amber-500 to-amber-600';
  return 'bg-gradient-to-r from-red-500 to-red-600';
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return 'text-emerald-700';
  if (confidence >= 60) return 'text-amber-700';
  if (confidence >= 40) return 'text-orange-700';
  return 'text-red-700';
};

// Signal interpretation functions
const getRSISignal = (rsi) => {
  if (!rsi) return 'NEUTRAL';
  if (rsi > 65) return 'SELL';
  if (rsi < 35) return 'BUY';
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
  
  const upperThreshold = bollinger.upper * 0.98;
  const lowerThreshold = bollinger.lower * 1.02;
  
  if (currentPrice >= upperThreshold) return 'SELL';
  if (currentPrice <= lowerThreshold) return 'BUY';
  return 'HOLD';
};

export default SignalPage;