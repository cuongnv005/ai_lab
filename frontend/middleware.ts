import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected routes (path-based; locale lives in a cookie, not the URL).
 * Currently empty - authentication protection is handled client-side via useAuth hook
 * and PermissionGuard components. Add routes here for edge-level protection
 * if middleware-level auth check becomes necessary.
 * 
 * Example: ["/dashboard", "/settings", "/admin"]
 *
 * NOTE: Sanctum SPA mode uses an HttpOnly session cookie, which the edge can
 * only check for *presence* (not validity) — treat it as a soft hint. The
 * authoritative checks happen server-side (RSC calling /api/auth/me) and
 * client-side (usePermission()/PermissionGuard). RBAC is never decided here.
 */
const PROTECTED_ROUTES: string[] = [];

/** Routes that authenticated users should NOT visit (redirect → dashboard). */
const AUTH_ROUTES = ["/login", "/register"];

// ─── Helpers ───────────────────────────────────────────────────────────────

function hasSessionCookie(request: NextRequest): boolean {
  // Since the frontend uses Bearer token authentication, only the presence of auth_token cookie determines session state.
  return request.cookies.has("auth_token");
}

// ─── Middleware ─────────────────────────────────────────────────────────────

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasSessionCookie(request);

  // 1. Redirect authenticated users away from auth pages (login, register)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Protect routes — authentication only, RBAC is handled client-side
  const isProtected = PROTECTED_ROUTES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
