import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-blue-50 w-full">
        <h2 className="text-2xl font-bold text-blue-500">TradeWise</h2>
        <nav className="space-x-4 text-blue-600 font-medium">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/register">Register</a>
          <a href="/login">Log In</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="w-full text-center py-10 px-6">
          <h2 className="text-4xl font-bold mb-4">Empowering You with Smart Trading Signals</h2>
          <p className="text-lg mb-8">Search and understand signals for any stock with confidence.</p>
          <div className="max-w-xl mx-auto w-full">
            <SearchBar />
          </div>
        </section>

        {/* Features */}
        <section className="w-full bg-white py-10 px-6">
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
        <section className="w-full bg-gray-50 py-10 px-6">
          <h3 className="text-2xl font-bold text-center mb-10">How It Works</h3>
          <div className="flex flex-col md:flex-row justify-around gap-6 text-center">
            <div>
              <div className="w-32 h-32 bg-blue-100 rounded-md mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-blue-500">🔍</span>
              </div>
              <p>1. Search for a stock</p>
            </div>
            <div>
              <div className="w-32 h-32 bg-blue-100 rounded-md mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-blue-500">📈</span>
              </div>
              <p>2. View signal and breakdown</p>
            </div>
            <div>
              <div className="w-32 h-32 bg-blue-100 rounded-md mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-blue-500">🧠</span>
              </div>
              <p>3. Make informed trading decisions</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-sm text-center py-5 text-gray-500 border-t">
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