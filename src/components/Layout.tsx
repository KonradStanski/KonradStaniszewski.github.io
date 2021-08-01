import React from "react";
import { MetaProps } from "@app/types/layout";
import { Meta, Header, Footer } from "@app/components";

type LayoutProps = {
    children: React.ReactNode;
    customMeta?: MetaProps;
};

const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
    return (
        <div className="flex flex-col min-h-screen">
            <Meta customMeta={customMeta} />
            <Header />
            <main className="flex-grow">
                <div className="max-w-5xl px-8 py-4 md:mx-auto">{children}</div>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
