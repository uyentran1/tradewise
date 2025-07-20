import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Layout = ({ children, showSearch = true, hideLink }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)
                    `
                }}></div>
            </div>
            
            {/* Header */}
            <Header hideLink={hideLink} />
            
            {/* Main Content */}
            <main className="flex-1 relative z-10">
                {children}
            </main>
            
            {/* Footer */}
            <Footer />
            
            {/* Optional floating gradient orbs for visual appeal */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
    );
};

export default Layout;