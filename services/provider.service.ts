export const providerService = {
  getAllProviders: async function getAllProviders() {
    const response = await fetch(
      `${process.env.BETTER_AUTH_URL}/profile/providers/all`,
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
