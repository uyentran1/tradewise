import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [symbol, setSymbol] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      navigate(`/signal/${symbol.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-blue-50">
        <h1 className="text-xl font-bold text-blue-600">TradeWise</h1>
        <nav className="space-x-4 text-blue-600 font-medium">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/auth/register">Register</a>
          <a href="/auth/login">Log In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-16 px-6">
        <h2 className="text-4xl font-bold mb-4">Empowering You with Smart Trading Signals</h2>
        <p className="text-lg mb-8">Search and understand signals for any stock with confidence.</p>

        <form onSubmit={handleSubmit} className="flex justify-center items-center gap-2 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Get Signal
          </button>
        </form>
      </section>

      {/* Features */}
      <section className="bg-white py-12 px-6">
        <div className="flex flex-col md:flex-row justify-around text-center gap-6">
          <div>
            <p className="text-blue-500 text-3xl mb-2">✔️</p>
            <p className="font-semibold">Timely Technical Signals</p>
          </div>
          <div>
            <p className="text-blue-500 text-3xl mb-2">✔️</p>
            <p className="font-semibold">Easy to Understand Indicators</p>
          </div>
          <div>
            <p className="text-blue-500 text-3xl mb-2">✔️</p>
            <p className="font-semibold">Beginner-Friendly Insights</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 px-6">
        <h3 className="text-2xl font-bold text-center mb-10">How It Works</h3>
        <div className="flex flex-col md:flex-row justify-around gap-6 text-center">
          <div>
            <div className="w-32 h-32 bg-blue-100 rounded-md mx-auto mb-4 flex items-center justify-center">
              <span className="text-sm text-blue-500">(🔍)</span>
            </div>
            <p>1. Search for a stock</p>
          </div>
          <div>
            <div className="w-32 h-32 bg-blue-100 rounded-md mx-auto mb-4 flex items-center justify-center">
              <span className="text-sm text-blue-500">(📈)</span>
            </div>
            <p>2. View signal and breakdown</p>
          </div>
          <div>
            <div className="w-32 h-32 bg-blue-100 rounded-md mx-auto mb-4 flex items-center justify-center">
              <span className="text-sm text-blue-500">(🧠)</span>
            </div>
            <p>3. Make informed trading decisions</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-sm text-center py-6 text-gray-500 border-t mt-auto">
        <div className="space-x-4 mb-2">
          <a href="/help" className="hover:text-blue-600">Help</a>
          <a href="/privacy" className="hover:text-blue-600">Privacy</a>
          <a href="/contact" className="hover:text-blue-600">Contact</a>
        </div>
        <p>© 2025 TradeWise, All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;