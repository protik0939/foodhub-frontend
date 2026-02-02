import { cookies } from "next/headers";

export const userService = {
  getSession: async function () {
    try {
      const cookieStore = await cookies();
      const res = await fetch(
        `${process.env.BETTER_AUTH_URL}/api/auth/get-session`,
        {
          headers: {
            Cookie: cookieStore.toString(),
          },
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
