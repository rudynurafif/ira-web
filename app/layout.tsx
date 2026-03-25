/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./fonts.css";
import { Toaster } from "react-hot-toast";
import Header from "./_components/layout/Header";
import Footer from "./_components/layout/Footer";
import { Suspense } from "react";
import ClientProvider from "./_components/ClientProvider";
import { AppProvider } from "./_shared/context/AppContext";
import SentryConfigProvider from "./_components/SentryConfigProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Internet Rakyat",
  description: "Internet Rakyat Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        suppressHydrationWarning
        className={[
          "antialiased",
          "min-h-screen",
          "flex",
          "flex-col",
          "font-primary",
        ].join(" ")}
      >
        <Suspense>
          <AppProvider>
            <SentryConfigProvider>
              <ClientProvider>
                {/* {!maintenanceMode && <Header />} */}
                <Header />
                <main className="flex-1">
                  {/* Non-aktif perubahan consume SSE behaviour */}
                  {/* <SSEProvider> */}
                  {children}
                  {/* <Notification /> */}
                  {/* </SSEProvider> */}
                </main>
                <Footer />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 5000,
                  }}
                />
              </ClientProvider>
            </SentryConfigProvider>
          </AppProvider>
        </Suspense>

        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1232054002088314');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1232054002088314&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
      <GoogleAnalytics gaId={"G-F36SCC718L"} />
    </html>
  );
}
