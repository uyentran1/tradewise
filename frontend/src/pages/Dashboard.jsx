import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import Layout from '../layouts/Layout';
import { BookmarkIcon, HeartIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [savedSignals, setSavedSignals] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'watchlist'

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('DEBUG: Fetching dashboard data for user:', user);
        
        // Fetch both saved signals and watchlist data in parallel
        const [savedResponse, watchlistResponse] = await Promise.all([
          API.get('/saved-signals?limit=20'),
          API.get('/watchlist/with-signals')
        ]);

        console.log('DEBUG: Saved signals response:', savedResponse.data);
        console.log('DEBUG: Watchlist response:', watchlistResponse.data);

        setSavedSignals(savedResponse.data.savedSignals || []);
        setWatchlist(watchlistResponse.data.watchlistWithSignals || []);
        
        console.log('DEBUG: Set', savedResponse.data.savedSignals?.length || 0, 'saved signals');
        console.log('DEBUG: Set', watchlistResponse.data.watchlistWithSignals?.length || 0, 'watchlist items');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Function to delete a saved signal
  const handleDeleteSignal = async (signalId) => {
    try {
      await API.delete(`/saved-signals/${signalId}`);
      setSavedSignals(prev => prev.filter(signal => signal.id !== signalId));
    } catch (err) {
      console.error('Error deleting signal:', err);
      alert('Failed to delete signal');
    }
  };

  // Function to remove from watchlist
  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await API.delete(`/watchlist/${symbol}`);
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      alert('Failed to remove from watchlist');
    }
  };

  // Helper function to get recommendation styling
  const getRecommendationStyle = (recommendation) => {
    if (!recommendation) return 'bg-gray-100 text-gray-700';
    
    if (recommendation.includes('Buy') || recommendation === 'BUY') {
      return 'bg-green-100 text-green-700';
    }
    if (recommendation.includes('Sell') || recommendation === 'SELL') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Dashboard</h1>
            <p className="text-slate-600 mb-6">Please log in to view your saved signals and watchlist</p>
            <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-slate-600">
              Here are your saved signals and watchlist
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-8">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 px-6 py-4 text-lg font-semibold transition-colors ${
                  activeTab === 'saved'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BookmarkIcon className="w-5 h-5" />
                  Saved Signals ({savedSignals.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`flex-1 px-6 py-4 text-lg font-semibold transition-colors ${
                  activeTab === 'watchlist'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <HeartIcon className="w-5 h-5" />
                  Watchlist ({watchlist.length})
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'saved' ? (
                // Saved Signals Tab
                <div>
                  {savedSignals.length === 0 ? (
                    <div className="text-center py-12">
                      <BookmarkIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">No saved signals yet</h3>
                      <p className="text-slate-600 mb-6">
                        Visit any stock signal page and save signals for future review
                      </p>
                      <Link 
                        to="/" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Explore Signals
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {savedSignals.map((signal) => (
                        <div key={signal.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <Link 
                                to={`/signal/${signal.symbol}`}
                                className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {signal.symbol}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <ClockIcon className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-500">
                                  Saved {new Date(signal.saved_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSignal(signal.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete saved signal"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>

                          {signal.signal_data && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-lg font-semibold text-slate-800">
                                  ${signal.signal_data.currentPrice?.toFixed(2) || 'N/A'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationStyle(signal.signal_data.recommendation)}`}>
                                  {signal.signal_data.recommendation || 'N/A'}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">
                                Confidence: {signal.signal_data.confidence || 'N/A'}%
                              </div>
                            </div>
                          )}

                          {signal.notes && (
                            <div className="bg-white p-3 rounded-lg border border-slate-200 mb-4">
                              <p className="text-sm text-slate-700 italic">"{signal.notes}"</p>
                            </div>
                          )}

                          <Link
                            to={`/signal/${signal.symbol}`}
                            className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Current Signal
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Watchlist Tab
                <div>
                  {watchlist.length === 0 ? (
                    <div className="text-center py-12">
                      <HeartIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">Your watchlist is empty</h3>
                      <p className="text-slate-600 mb-6">
                        Add stocks to your watchlist to monitor them regularly
                      </p>
                      <Link 
                        to="/" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Find Stocks
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {watchlist.map((item) => (
                        <div key={item.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <div className="flex justify-between items-start mb-4">
                            <Link 
                              to={`/signal/${item.symbol}`}
                              className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {item.symbol}
                            </Link>
                            <button
                              onClick={() => handleRemoveFromWatchlist(item.symbol)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove from watchlist"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>

                          {item.current_price ? (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-semibold text-slate-800">
                                  ${parseFloat(item.current_price).toFixed(2)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRecommendationStyle(item.recommendation)}`}>
                                  {item.recommendation || 'N/A'}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">
                                Confidence: {item.confidence || 'N/A'}%
                              </div>
                              {item.signal_date && (
                                <div className="text-xs text-slate-500 mt-1">
                                  Updated: {new Date(item.signal_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mb-4 text-sm text-slate-500">
                              No recent signal data available
                            </div>
                          )}

                          <div className="text-xs text-slate-500 mb-4">
                            Added: {new Date(item.added_at).toLocaleDateString()}
                          </div>

                          <Link
                            to={`/signal/${item.symbol}`}
                            className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Signal
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}