export const providerService = {
  getAllProviders: async function getAllProviders() {
    const baseUrl =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:5000";

    const response = await fetch(
      `${baseUrl}/profile/providers/all`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to Get!");
    }
    return response.json();
  },
};
