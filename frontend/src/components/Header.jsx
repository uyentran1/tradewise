import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = ({ hideLink }) => {
    const { user, logout } = useContext(AuthContext);
    
    return (
        <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur-md border-b border-purple-200 w-full shadow-sm">
            {/* Logo section */}
            <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <span className="text-white font-bold text-lg">TW</span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity blur"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    TradeWise
                </span>
            </Link>

            {/* Navigation buttons */}
            <nav className="flex items-center space-x-6">
                {user ? (
                    <>
                        <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-gray-700 font-medium">
                                Hello, {user.fullName?.split(' ')[0] || user.email?.split('@')[0]}!
                            </span>
                        </div>
                        
                        <Link 
                            to="/" 
                            className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:underline decoration-purple-300"
                        >
                            Home
                        </Link>
                        
                        <Link 
                            to="/about" 
                            className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:underline decoration-purple-300"
                        >
                            About
                        </Link>
                        
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-purple-600 hover:text-purple-800 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-200"
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link 
                            to="/" 
                            className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:underline decoration-purple-300"
                        >
                            Home
                        </Link>
                        
                        <Link 
                            to="/about" 
                            className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:underline decoration-purple-300"
                        >
                            About
                        </Link>
                        
                        {hideLink !== 'register' && (
                            <Link 
                                to="/register" 
                                className="px-4 py-2 text-purple-600 hover:text-purple-800 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-200"
                                >
                                Sign Up
                            </Link>
                        )}
                        
                        {hideLink !== 'login' && (
                            <Link 
                            to="/login" 
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600  font-medium rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            style={{ color: 'white' }}
                            >
                                Log In
                            </Link>
                        )}
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;