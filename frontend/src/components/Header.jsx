import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const isAuthPage = location.pathName === '/login' || location.pathName === '/register';

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-blue-50 w-full">
            <Link to="/" className="text-2xl font-bold text-blue-500">TradeWise</Link>
            {!isAuthPage && (
                <nav className="space-x-4 text-blue-600 font-medium">
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/register">Sign Up</Link>
                    <Link to="/login">Log In</Link>
                </nav>
            )}
        </header>
    );
};

export default Header;