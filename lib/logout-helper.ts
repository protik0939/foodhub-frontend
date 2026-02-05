import { authClient } from "@/lib/auth-client";

type LogoutOptions = {
  onAfter?: () => void;
};

  const BackendURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

export async function logoutEverywhere(options?: LogoutOptions) {

  try {
    await authClient.signOut();
  } catch (error) {
    console.log("Logout error:", error);
  }

  // Best-effort cleanup for any old backend-domain cookies.
  if (BackendURL) {
    try {
      await fetch(`${BackendURL}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.log("Legacy backend logout failed:", error);
    }
  }

  options?.onAfter?.();
}
