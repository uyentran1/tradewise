import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [symbol, setSymbol] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (symbol.trim() === '') return;
        
        setIsLoading(true);
        
        // Add a slight delay to show loading state
        setTimeout(() => {
            navigate(`/signal/${symbol.toUpperCase()}`);
            setSymbol('');
            setIsLoading(false);
        }, 300);
    };

    const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Main Search Form */}
            <form onSubmit={handleSubmit} className="relative group mb-8">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input 
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            placeholder="Enter stock symbol (e.g., AAPL, TSLA, GOOGL)"
                            className="w-full pl-12 pr-6 py-2 text-lg border-2 border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/90 placeholder-slate-500 backdrop-blur-sm"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || symbol.trim() === ''}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Analysing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <span>Analyse</span>
                            </div>
                        )}
                    </button>
                </div>
            </form>
            
            {/* Popular Stocks */}
            <div className="text-center">
                <p className="text-slate-300 mb-4 font-medium">Popular stocks:</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {popularStocks.map((stock) => (
                        <button
                            key={stock}
                            onClick={() => {
                                setSymbol(stock);
                                setIsLoading(true);
                                setTimeout(() => {
                                    navigate(`/signal/${stock}`);
                                    setSymbol('');
                                    setIsLoading(false);
                                }, 300);
                            }}
                            className="px-4 py-2 text-sm bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-white font-medium hover:scale-105 shadow-sm hover:shadow-md backdrop-blur-sm"
                            disabled={isLoading}
                        >
                            {stock}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchBar;