import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = ({ hideLink }) => {
    const { user, logout } = useContext(AuthContext);
    
    return (
        <header className="flex justify-between items-center px-6 py-4 bg-blue-50 w-full">
            {/* Logo section */}
            <Link to="/" className="flex items-center space-x-2">
                <img src="../public/tradewise-logo.png" alt="TradeWise Logo" className="h-8 w-8" />
                <span className="text-2xl font-bold text-blue-500">TradeWise</span>
             </Link>

            {/* Navigation buttons */}
            <nav className="space-x-4 text-blue-500 font-medium flex items-center">
                {user ? (
                    <>
                    <span className="text-gray-600">Hello, {user.fullName || user.email}!</span>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/" onClick={logout} className="text-blue-500 underline">Log out</Link>
                    </>
                ) : (
                    <>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    {hideLink !== 'register' && <Link to="/register">Sign Up</Link>}
                    {hideLink !== 'login' && <Link to="/login">Log In</Link>}
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;