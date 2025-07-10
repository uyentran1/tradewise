import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Layout = ({ children, showSearch=true, hideLink }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header hideLink={hideLink}/>
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;