import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = ({ hideLink, showSearch=true }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/signal/${searchQuery.toUpperCase()}`);
            setSearchQuery('');
        }
    };
    
    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full shadow-sm">
            <div className="flex justify-between items-center px-6 py-4">
                {/* Logo section */}
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            <span className="text-white font-bold text-lg">TW</span>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-slate-800 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity blur"></div>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-slate-700 bg-clip-text text-transparent">
                        TradeWise
                    </span>
                </Link>

                {/* Header Search Bar - Show only if not HomePage and showSearch is true */}
                {showSearch && !isHomePage &&!isAuthPage && (
                    <div className="hidden md:block w-70 ml-140 mr-4">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-3 pr-8 border-slate-300 rounded-sm text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                    placeholder="Search a stock"
                                />
                                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Navigation buttons */}
                <nav className="flex items-center space-x-6">
                {user ? (
                    <>
                        <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-slate-700 font-medium">
                                {user.fullName?.split(' ')[0] || user.email?.split('@')[0]}
                            </span>
                        </div>
                        
                        <Link 
                            to="/" 
                            className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:underline decoration-blue-300"
                        >
                            Home
                        </Link>
                        
                        <Link 
                            to="/about" 
                            className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:underline decoration-purple-300"
                        >
                            About
                        </Link>
                        
                        <Link 
                            to="/watchlist" 
                            className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:underline decoration-blue-300"
                        >
                            Watchlist
                        </Link>
                        
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-slate-600 hover:text-red-600 font-medium border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link 
                            to="/" 
                            className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:underline decoration-blue-300"
                        >
                            Home
                        </Link>
                        
                        <Link 
                            to="/about" 
                            className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:underline decoration-blue-300"
                        >
                            About
                        </Link>
                                                
                        {hideLink !== 'register' && (
                            <Link 
                                to="/register" 
                                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200"
                            >
                                Sign Up
                            </Link>
                        )}
                        
                        {hideLink !== 'login' && (
                            <Link 
                                to="/login" 
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-white"
                                style={{ color: "white"}}

                            >
                                Sign In
                            </Link>
                        )}
                    </>
                )}
            </nav>
            </div>
        </header>
    );
};

export default Header;