import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [symbol, setSymbol] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (symbol.trim() === '') return;
        navigate(`/signal/${symbol.toUpperCase()}`);
        setSymbol('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 justify-center mb-4">
            <input 
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter stock symbol (e.g. AAPL)"
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type='submit' className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Search</button>
        </form>
    );
};

export default SearchBar;