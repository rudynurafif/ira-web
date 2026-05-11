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
  // [iOS DEEP LINK] Redirect .well-known ke API route
  // ─────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        destination: "/api/.well-known/apple-app-site-association",
        permanent: false,
      },
    ];
  },

  // ─────────────────────────────────────────────────────
  // [iOS DEEP LINK] Headers wajib untuk AASA file
  // ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/.well-known/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
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
    ];
  },
};

export default nextConfig;
