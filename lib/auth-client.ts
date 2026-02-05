import { createAuthClient } from "better-auth/react";

const serverFallbackUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "http://localhost:3000";

const baseURL =
  typeof window === "undefined" ? serverFallbackUrl : window.location.origin;

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});
