import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-t border-purple-200">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">TW</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                TradeWise
                            </span>
                        </div>
                        <p className="text-gray-600 mb-4 max-w-md">
                            Empowering traders with smart technical analysis and AI-powered insights. 
                            Make informed decisions with professional-grade signals made simple.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 bg-white border border-purple-200 rounded-lg flex items-center justify-center hover:bg-purple-50 transition-colors">
                                <span className="text-purple-600">📧</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white border border-purple-200 rounded-lg flex items-center justify-center hover:bg-purple-50 transition-colors">
                                <span className="text-purple-600">🐦</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white border border-purple-200 rounded-lg flex items-center justify-center hover:bg-purple-50 transition-colors">
                                <span className="text-purple-600">💼</span>
                            </a>
                        </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/about" className="text-gray-600 hover:text-purple-600 transition-colors">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/features" className="text-gray-600 hover:text-purple-600 transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
                                    Pricing
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/help" className="text-gray-600 hover:text-purple-600 transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="/terms" className="text-gray-600 hover:text-purple-600 transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Bottom Bar */}
                <div className="border-t border-purple-200 pt-6">
                    <p className="flex items-center space-x-4 text-sm text-gray-600">© 2025 TradeWise. All rights reserved.</p>
                </div>
            
            </div>
            
            {/* Gradient decoration */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
        </footer>
    );
};

export default Footer;