import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import React from "react";
import "@app/styles/globals.css";
import * as gtag from "@app/utils/gtag";

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const router = useRouter();

    // enable gtag events when router detects route change
    useEffect(() => {
        const handleRouteChange = (url: URL) => {
            gtag.pageview(url); // calls pageView function to trigger page view event and register url visited
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [router.events]);

    return (
        <ThemeProvider attribute="class" enableSystem={true} defaultTheme="light">
            <Component {...pageProps} />
        </ThemeProvider>
    );
};

export default App;
