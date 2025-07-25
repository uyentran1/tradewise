import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Layout = ({ children, showSearch = true, hideLink }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Grid pattern background */}
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
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
        </div>
    );
};

export default Layout;