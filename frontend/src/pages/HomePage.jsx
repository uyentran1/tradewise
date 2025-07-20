import React from 'react';
import Layout from '../layouts/Layout';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="w-full text-center py-10 px-6 bg-blue-50">
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
            {/* <p className="text-blue-500 text-3xl mb-2">✔️</p> */}
            <p className="font-semibold">Timely Technical Signals</p>
          </div>
          <div>
            {/* <p className="text-blue-500 text-3xl mb-2">✔️</p> */}
            <p className="font-semibold">Easy to Understand Indicators</p>
          </div>
          <div>
            {/* <p className="text-blue-500 text-3xl mb-2">✔️</p> */}
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
    </Layout>
  );
};

export default HomePage;