import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full text-sm text-center py-5 text-gray-500 border-t bg-blue-50">
            <div className="space-x-4 mb-2">
                <a href="/help" className="hover:text-blue-600">Help</a>
                <a href="/privacy" className="hover:text-blue-600">Privacy</a>
                <a href="/contact" className="hover:text-blue-600">Contact</a>
            </div>
            <p>© 2025 TradeWise, All rights reserved.</p>
        </footer>
    );
};

export default Footer;