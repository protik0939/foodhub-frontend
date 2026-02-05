import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/account-suspended",
  ];
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/" || // Exact match for homepage only
    pathname.startsWith("/topbrands") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/meals") // If meal pages should be public
  ) {
    return NextResponse.next();
  }

  // For cross-origin auth, check session via API call to backend
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionResponse = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/get-session`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    const session = await sessionResponse.json();

    // If no valid session, redirect to login
    if (!session || session.error || !session.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Allow access if session exists
    return NextResponse.next();
  } catch (error) {
    console.error("Session check failed:", error);
    // On error, redirect to login for safety
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/:path*"],
};
