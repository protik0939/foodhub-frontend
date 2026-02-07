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
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
      },
      {
        source: "/orders/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/:path*`,
      },
      {
        source: "/profile/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/:path*`,
      },
      {
        source: "/meals/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/meals/:path*`,
      },
      {
        source: "/categories/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/categories/:path*`,
      },
      {
        source: "/reviews/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/reviews/:path*`,
      },
    ];
  },
};


export default nextConfig;
