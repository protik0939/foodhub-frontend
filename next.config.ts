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
      // Specific meal API routes to avoid conflicts with frontend pages
      {
        source: "/meals",
        destination: `${backendURL}/meals`,
      },
      {
        source: "/meals/provider/:providerId",
        destination: `${backendURL}/meals/provider/:providerId`,
      },
      {
        source: "/meals/category/:categoryId",
        destination: `${backendURL}/meals/category/:categoryId`,
      },
      // Only match /meals/:id (UUID format) without additional path segments
      {
        source: "/meals/:id([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$",
        destination: `${backendURL}/meals/:id`,
      },
      {
        source: "/categories/:path*",
        destination: `${backendURL}/categories/:path*`,
      },
      {
        source: "/reviews/:path*",
        destination: `${backendURL}/reviews/:path*`,
      },
    ];
  },
};


export default nextConfig;
