import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = ({ hideLink }) => {
    const { user, logout } = useContext(AuthContext);
    
    return (
        <header className="flex justify-between items-center px-6 py-4 bg-blue-50 w-full">
            <Link to="/" className="text-2xl font-bold text-blue-500">TradeWise</Link>
            <nav className="space-x-4 text-blue-600 font-medium">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                {/* {hideLink !== 'register' && <Link to="/register">Sign Up</Link>}
                {hideLink !== 'login' && <Link to="/login">Log In</Link>} */}
                
                {user ? (
                    <>
                        <span className="text-gray-600">👋 Hello, {user.fullName || user.email}!</span>
                        {/* <button onClick={logout} className="text-blue-600 underline ml-4">Logout</button> */}
                        <button
                            onClick={logout}
                            className="text-blue-600 underline ml-4 hover:text-blue-800 transition"
                            aria-label="Logout"
                        >
                            Log out
                        </button>
                    </>
                    ) : (
                    <>
                        {hideLink !== 'register' && <Link to="/register">Sign Up</Link>}
                        {hideLink !== 'login' && <Link to="/login">Log In</Link>}
                    </>
                )}

            </nav>
        </header>
    );
};

export default Header;