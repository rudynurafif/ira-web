import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "ui-avatars.com",
      "codify-fwa.obs.ap-southeast-4.myhuaweicloud.com",
    ],
  },

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
