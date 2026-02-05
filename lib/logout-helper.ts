import { authClient } from "./auth-client";

/**
 * Clear all browser cookies
 */
export const clearAllCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const cookieName = cookie.split("=")[0].trim();
    // Clear for current path
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    // Clear for root domain
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname}`;
    // Clear for all subdomains
    const domainParts = window.location.hostname.split(".");
    if (domainParts.length > 1) {
      const rootDomain = domainParts.slice(-2).join(".");
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${rootDomain}`;
    }
  });
};

export const performLogout = async (
  router: { push: (url: string) => void; refresh: () => void },
  redirectPath: string = "/login"
) => {
  try {
    // Sign out from backend
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          clearAllCookies();
          router.refresh();
          router.push(redirectPath);
        },
        onError: (error) => {
          console.log("Backend logout failed:", error.error);
          // Still clear cookies and redirect
          clearAllCookies();
          router.refresh();
          router.push(redirectPath);
        },
      },
    });
  } catch (error) {
    console.log("Logout error:", error);
    // Fallback: clear cookies and redirect anyway
    clearAllCookies();
    router.refresh();
    router.push(redirectPath);
  }
};
