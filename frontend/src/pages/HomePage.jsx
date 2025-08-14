import React from 'react';
import Layout from '../layouts/Layout';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  return (
    <Layout>
  

      {/* Hero Section */}
      <section className="w-full text-center py-20 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent leading-tight">
            Empowering You with Smart Trading Signals
          </h1>
          <p className="text-xl mb-12 text-slate-300 max-w-3xl mx-auto font-medium">
            Search and understand signals for US stocks with confidence. 
          </p>
          {/* <p className="text-lg mb-12 text-slate-400 max-w-2xl mx-auto">
            Make data-driven decisions with confidence.
          </p> */}
          <div className="max-w-2xl mx-auto w-full">
            <SearchBar />
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="w-full bg-slate-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built for traders with accuracy, speed, and insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Timely Technical Signals</h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Real-time analysis with RSI, MACD, SMA, and Bollinger Bands. Get precise entry and exit signals with confidence scoring.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Advanced Chart Analysis</h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Interactive candlestick charts with technical overlays. Visualise price action and indicator relationships clearly.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Educational Insights</h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Learn while you trade with detailed explanations of each indicator and market conditions. Master technical analysis.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* How It Works */}
      <section className="w-full bg-slate-800 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our streamlined process gets you from market data to actionable insights in seconds.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="relative -right-16 w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  1
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 pb-2">Search Any Stock</h3>
              <p className="text-slate-300 leading-relaxed">
                Enter any stock symbol to access <br /> 
                technical analysis and market data.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="relative -right-14 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  2
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 pb-2">Analyse Signals</h3>
              <p className="text-slate-300 leading-relaxed">
                Review technical indicators with clear buy, sell,  <br />  
                or hold recommendations backed by data.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="relative -right-16 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  3
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 pb-2">Make Informed Decisions</h3>
              <p className="text-slate-300 leading-relaxed">
                Execute trades with confidence using our <br /> 
                signal scoring and detailed analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      
    </Layout>
  );
};

export default HomePage;