import type { Metadata } from "next";
import { Be_Vietnam_Pro, Figtree, Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "./_components/layout/Header";
import Footer from "./_components/layout/Footer";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"], // Gunakan subset latin
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Pilih bobot  font (opsional)
  variable: "--font-be-vietnam", // Variabel CSS untuk font (opsional)
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Pilih bobot sesuai kebutuhan
  variable: "--font-figtree",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Pilih bobot sesuai kebutuhan
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "FWA",
  description: "FWA Web",
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
          beVietnamPro.variable,
          figtree.variable,
          raleway.variable,
          "antialiased",
          "min-h-screen",
          "flex",
          "flex-col",
          "font-primary",
        ].join(" ")}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
