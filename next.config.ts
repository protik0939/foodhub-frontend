import type { NextConfig } from "next";

const backendURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://food-hub-backend-teal.vercel.app" || "http://localhost:5000";

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
        source: "/api/admin/:path*",
        destination: `${backendURL}/admin/:path*`,
      },
      {
        source: "/api/categories",
        destination: `${backendURL}/categories`,
      },
      {
        source: "/api/categories/:path*",
        destination: `${backendURL}/categories/:path*`,
      },
      {
        source: "/api/meals",
        destination: `${backendURL}/meals`,
      },
      {
        source: "/api/meals/:path*",
        destination: `${backendURL}/meals/:path*`,
      },
      {
        source: "/api/select-role",
        destination: `${backendURL}/select-role`,
      },
      {
        source: "/api/:path*",
        destination: `${backendURL}/api/:path*`,
      },
      {
        source: "/orders/:path*",
        destination: `${backendURL}/orders/:path*`,
      },
      {
        source: "/profile/:path*",
        destination: `${backendURL}/profile/:path*`,
      },
      {
        source: "/reviews/:path*",
        destination: `${backendURL}/reviews/:path*`,
      },
    ];
  },
};


export default nextConfig;
