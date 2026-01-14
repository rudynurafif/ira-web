import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./fonts.css";
import { Toaster } from "react-hot-toast";
import Header from "./_components/layout/Header";
import Footer from "./_components/layout/Footer";
import { Suspense } from "react";
import ClientProvider from "./_components/ClientProvider";

export const metadata: Metadata = {
  title: "Internet Rakyat",
  description: "Internet Rakyat Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

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
          <ClientProvider>
            {/* {!maintenanceMode && <Header />} */}
            <Header />
            <main className="flex-1">
              {/* Non-aktif perubahan consume SSE behaviour */}
              {/* <SSEProvider> */}
              {children}
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
        </Suspense>
      </body>
    </html>
  );
}
