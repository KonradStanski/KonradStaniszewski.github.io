import React from 'react';
import { MetaProps } from '../types/layout';
import Head from './Head';
import Header from './Header/Header';
import Footer from './Footer';

type LayoutProps = {
    children: React.ReactNode;
    customMeta?: MetaProps;
};

const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
    return (
        <body className="flex flex-col min-h-screen">
            <Head customMeta={customMeta} />
            <Header />
            <main className="flex-grow">
                <div className="max-w-5xl px-1 md:px-8 py-4 md:mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
        </body>
    );
};

export default Layout;
