import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.BETTER_AUTH_URL}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${process.env.BETTER_AUTH_URL}/:path*`,
      },
    ];
  },
};


export default nextConfig;
