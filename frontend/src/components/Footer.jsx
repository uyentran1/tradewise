import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-slate-800 border-t border-slate-700">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-slate-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">TW</span>
                            </div>
                            <span className="text-2xl font-bold text-white">
                                TradeWise
                            </span>
                        </div>
                        <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
                            Educational trading signals and technical analysis platform. 
                            Empowering traders with data-driven to make informed trading decisions.
                        </p>
                        <div className="flex space-x-4">
                            <a href="mailto:contact@tradewise.com" className="w-10 h-10 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors">
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors">
                                <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                            
                        </div>
                    </div>
                    
                    {/* Platform */}
                    <div>
                        <h4 className="font-semibold text-white mb-6 pb-3">Platform</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="/" className="text-slate-300 hover:text-white transition-colors">
                                    Live Signals
                                </a>
                            </li>
                            <li>
                                <a href="/charts" className="text-slate-300 hover:text-white transition-colors">
                                    Advanced Charts
                                </a>
                            </li>
                            <li>
                                <a href="/screener" className="text-slate-300 hover:text-white transition-colors">
                                    Stock Screener
                                </a>
                            </li>
                            <li>
                                <a href="/watchlist" className="text-slate-300 hover:text-white transition-colors">
                                    Watchlists
                                </a>
                            </li>
                            <li>
                                <a href="/alerts" className="text-slate-300 hover:text-white transition-colors">
                                    Price Alerts
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-white mb-6 pb-3">Resources</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="/education" className="text-slate-300 hover:text-white transition-colors">
                                    Trading Education
                                </a>
                            </li>
                            <li>
                                <a href="/api" className="text-slate-300 hover:text-white transition-colors">
                                    API Documentation
                                </a>
                            </li>
                            <li>
                                <a href="/blog" className="text-slate-300 hover:text-white transition-colors">
                                    Market Insights
                                </a>
                            </li>
                            <li>
                                <a href="/help" className="text-slate-300 hover:text-white transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-slate-300 hover:text-white transition-colors">
                                    Contact Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                
            
                
                {/* Bottom Bar */}
                <div className="border-t border-slate-700 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-6 text-sm text-slate-400">
                            <span>© 2025 TradeWise. All rights reserved.</span>
                            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>Market data provided by</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">TD</span>
                                </div>
                                <span className="text-slate-300">Twelve Data</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom accent line */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
        </footer>
    );
};

export default Footer;