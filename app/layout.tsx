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
        {/* <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1232054002088314&ev=PageView&noscript=1"
            alt=""
          />
        </noscript> */}

        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
              ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              
              ttq.load('D4JV2QBC77UEBGID118G');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      </body>
      {/* <GoogleAnalytics gaId={"G-F36SCC718L"} /> */}
    </html>
  );
}
