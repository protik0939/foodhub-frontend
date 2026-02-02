import { UserProfile } from "@/types/user.type";

export const userProfileService = {
  getUserProfile: async function (userId: string): Promise<UserProfile | null> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/profile/customers/${userId}`,
      {
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  },
};
