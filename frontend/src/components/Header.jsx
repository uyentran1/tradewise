import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ hideLink }) => {
    return (
        <header className="flex justify-between items-center px-6 py-4 bg-blue-50 w-full">
            <Link to="/" className="text-2xl font-bold text-blue-500">TradeWise</Link>
            <nav className="space-x-4 text-blue-600 font-medium">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                {hideLink !== 'register' && <Link to="/register">Sign Up</Link>}
                {hideLink !== 'login' && <Link to="/login">Log In</Link>}
            </nav>
        </header>
    );
};

export default Header;