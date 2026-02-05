import { cookies } from "next/headers";

export const userService = {
  getSession: async function () {
    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
        "http://localhost:3000";
      const cookieStore = await cookies();
      const res = await fetch(
        `${appUrl}/api/auth/get-session`,
        {
          headers: {
            Cookie: cookieStore.toString(),
          },
          credentials: "include",
          cache: "no-store",
        },
      );

      const session = await res.json();

      if (session === null) {
        return { data: null, error: { message: "Session is missing." } };
      }

      return { data: session, error: null };
    } catch (err) {
      console.error(err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },


};
