import React from 'react';
import Layout from '../layouts/Layout';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="w-full text-center py-16 px-6 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent py-1">
            Empowering You with Smart Trading Signals
          </h2>
          <p className="text-xl mb-10 text-gray-700 max-w-2xl mx-auto">
            Search and understand signals for any stock with confidence. Get professional-grade technical analysis made simple.
          </p>
          <div className="max-w-xl mx-auto w-full">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 bg-clip-text text-transparent">
            Why Choose Our Platform?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">⚡</span>
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Timely Technical Signals</h4>
              <p className="text-gray-600">Real-time analysis with RSI, MACD, SMA, and Bollinger Bands for precise market timing.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Easy to Understand Indicators</h4>
              <p className="text-gray-600">Complex technical analysis simplified with clear explanations and visual charts.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">🎓</span>
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Beginner-Friendly Insights</h4>
              <p className="text-gray-600">Learn as you trade with educational tooltips and detailed signal explanations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 bg-clip-text text-transparent">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative z-10">
                  <span className="text-4xl">🔍</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-20">
                  1
                </div>
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Search for a Stock</h4>
              <p className="text-gray-600">Enter any stock symbol to get instant technical analysis and trading signals.</p>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-blue-100 border border-purple-200 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative z-10">
                  <span className="text-4xl">📈</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-20">
                  2
                </div>
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">View Signal & Breakdown</h4>
              <p className="text-gray-600">Analyze comprehensive charts with technical indicators and AI-powered insights.</p>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 border border-purple-200 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative z-10">
                  <span className="text-4xl">🧠</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-20">
                  3
                </div>
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Make Informed Decisions</h4>
              <p className="text-gray-600">Execute trades with confidence using our clear BUY, SELL, or HOLD recommendations.</p>
            </div>
          </div>
        </div>
      </section>
      
    </Layout>
  );
};

export default HomePage;