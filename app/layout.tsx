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
      </body>
    </html>
  );
}
