import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.PROD_APP_URL,
  fetchOptions: {
    credentials: "include",
  },
});
