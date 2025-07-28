import React from 'react';
import { Link } from 'react-router-dom';
import Layout from "../layouts/Layout";

export default function About() {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col justify-center items-center py-20 px-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5"></div>
                
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
                
                <div className="relative z-10 w-full max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-20">
                        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent leading-tight">
                            About TradeWise
                        </h1>
                        <p className="text-2xl text-slate-300 font-medium max-w-4xl mx-auto leading-relaxed">
                            Empowering traders with smart signals and educational insights
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mt-8 rounded-full"></div>
                    </div>

                    {/* Cards Section */}
                    <div className="grid md:grid-cols-3 gap-10 mb-20">
                        {/* Card 1 - What is a Signal */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group">
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-6 text-center">
                                What is a Signal?
                            </h3>
                            <p className="text-slate-300 text-center leading-relaxed text-lg">
                                Signals are indicators that suggest the likely direction of a stock's price.
                            </p>
                        </div>

                        {/* Card 2 - Understanding Indicators */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group">
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-6 text-center">
                                Understanding Indicators
                            </h3>
                            <p className="text-slate-300 text-center leading-relaxed text-lg">
                                Technical indicators like SMA, RSI, MACD, and Bollinger Bands are used to generate signals.
                            </p>
                        </div>

                        {/* Card 3 - Perfect for All Levels */}
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group">
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-6 text-center">
                                Helpful for Beginners
                            </h3>
                            <p className="text-slate-300 text-center leading-relaxed text-lg">
                                Our signals aim to simplify complex technical analysis to assist in your trading decisions.
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center my-20">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                        <div className="mx-8">
                            {/* <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"></div> */}
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>

                    {/* Why Choose TradeWise Section */}
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Why Choose TradeWise?
                        </h2>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12">
                            Built for traders with accuracy, speed, and comprehensive market insights.
                        </p>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 text-center">Timely Technical Signals</h3>
                                <p className="text-slate-300 text-center leading-relaxed">
                                    Real-time analysis with RSI, MACD, SMA, and Bollinger Bands. Get precise entry and exit signals with confidence scoring.
                                </p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 text-center">Advanced Chart Analysis</h3>
                                <p className="text-slate-300 text-center leading-relaxed">
                                    Interactive candlestick charts with technical overlays. Visualise price action and indicator relationships clearly.
                                </p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 text-center">Educational Insights</h3>
                                <p className="text-slate-300 text-center leading-relaxed">
                                    Learn while you trade with detailed explanations of each indicator and market conditions. Master technical analysis.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back to Homepage Button */}
                    <div className="text-center">
                        <Link 
                            to="/"
                            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-10 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.05] shadow-xl hover:shadow-2xl border border-white/20 backdrop-blur-lg"
                        >
                            <span className="flex items-center space-x-2 text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back to Homepage</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};