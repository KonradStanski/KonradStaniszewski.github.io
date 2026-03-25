import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

function MyApp({ Component, pageProps }: AppProps) {
  const fullWidth = (Component as any).fullWidth;
  return (
    <ThemeProvider
      disableTransitionOnChange
      defaultTheme="system"
      attribute="class"
    >
      <div className="flex flex-col max-w-5xl mx-auto px-4">
        <Header />
      </div>
      <div className={fullWidth ? "px-4" : "max-w-5xl mx-auto px-4"}>
        <Component {...pageProps} />
        <GoogleAnalytics gaId="G-1M9XX68M0R"/>
      </div>
      <div className="flex flex-col max-w-5xl mx-auto px-4">
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default MyApp;
