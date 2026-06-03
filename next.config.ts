import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "codify-fwa.obs.ap-southeast-4.myhuaweicloud.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // [DEEP LINK] Redirects
  // ─────────────────────────────────────────────────────
  async redirects() {
    return [
      // ❌ HAPUS redirect iOS karena sekarang pakai static file di public/
      // ✅ Jika ada redirect lain yang diperlukan, bisa ditambahkan di sini
    ];
  },

  // ─────────────────────────────────────────────────────
  // [DEEP LINK] Headers wajib untuk file .well-known
  // ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // ✅ Ini akan cover BOTH:
        // - /.well-known/apple-app-site-association (iOS)
        // - /.well-known/assetlinks.json (Android)
        source: "/.well-known/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/json", // ✅ WAJIB untuk Apple AASA
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },

  // ─────────────────────────────────────────────────────
  // [EXISTING] Rewrites untuk API proxy (tetap sama)
  // ─────────────────────────────────────────────────────
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_INTERNAL_API_BASE_URL}/:path*`,
      },
      {
        source: "/api-mapsearch/:path*",
        destination: `${process.env.NEXT_PUBLIC_INTERNAL_MAP_SEARCH_API_BASE_URL || process.env.NEXT_PUBLIC_MAP_SEARCH_API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
