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

    const popularStocks = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'NVDA'];

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Main Search Form */}
            <form onSubmit={handleSubmit} className="relative group">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <input 
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            placeholder="Enter stock symbol (e.g. AAPL, TSLA, GOOGL)"
                            className="w-full px-6 py-3 text-lg border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 placeholder-gray-500"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || symbol.trim() === ''}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Analysing...</span>
                            </div>
                        ) : (
                            <span className="flex items-center space-x-2">Analyse</span>
                        )}
                    </button>
                </div>
            </form>
            
            {/* Popular Stocks */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3 font-medium">Popular stocks:</p>
                <div className="flex flex-wrap justify-center gap-2">
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
                            className="px-4 py-2 text-sm bg-white border border-purple-200 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 transition-all duration-200 text-purple-700 font-medium hover:scale-105 shadow-sm hover:shadow-md"
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