import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-slate-800 border-t border-slate-700">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-2">
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
                            Empowering you with data-driven insights to make informed trading decisions.
                        </p>
                        
                    </div>
                    
                    {/* Platform */}
                    <div>
                        <h4 className="font-semibold text-white mb-6 pb-3">Platform</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="/" className="text-slate-300 hover:text-white transition-colors">
                                    Search Stock
                                </a>
                            </li>
                            <li>
                                <a href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                                    Dashboard
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-white mb-6 pb-3">Resources</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="/about" className="text-slate-300 hover:text-white transition-colors">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="https://www.investopedia.com/trading-basic-education-4689651" className="text-slate-300 hover:text-white transition-colors">
                                    Trading Education
                                </a>
                            </li>
                            <li>
                                <a href="https://twelvedata.com/docs#quickstart" className="text-slate-300 hover:text-white transition-colors">
                                    API Documentation
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