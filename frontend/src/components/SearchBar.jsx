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
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <input 
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder='Enter stock symbol (e.g. AAPL)'
                style={{ padding: '0.5rem', marginRight: '0.5rem' }}
            />
            <button type='submit' style={{ padding: '0.5rem' }}>Search</button>
        </form>
    );
};

export default SearchBar;