import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEYS } from "@/constants/storage";
import { ROUTES } from "@/constants/routes";

// Public page paths that do not require an active login session
const PUBLIC_PAGE_ROUTES = new Set<string>([
  ROUTES.HOME, // "/"
  ROUTES.AUTH, // "/auth"
  "/login",
  "/signup",
  "/register",
]);

// Public API endpoints that can be reached without a session
const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/organizations",
  "/api/health",
  "/api/otp",
  "/v1",
];

/**
 * Next.js Edge Proxy Handler (Next.js 16+ convention)
 * Handles:
 * 1. Edge-level route protection (restricting non-public routes to logged-in sessions)
 * 2. Request tracing via unique correlation IDs (x-request-id)
 * 3. Response timing telemetry and security headers
 */
export function proxy(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { pathname, search } = request.nextUrl;

  const authToken = request.cookies.get(STORAGE_KEYS.AUTH_TOKEN)?.value;
  const isAuthenticated = Boolean(authToken && authToken.trim().length > 0);

  // If authenticated user attempts to visit any auth page, redirect to dashboard
  const isAuthPage = pathname === ROUTES.AUTH || pathname === "/login" || pathname === "/signup" || pathname === "/register";
  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.DASHBOARD;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3. Determine if route is public
  const isPublicPage = PUBLIC_PAGE_ROUTES.has(pathname);
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // 4. Protect all non-public routes: redirect unauthenticated requests to /auth
  if (!isAuthenticated && !isPublicPage && !isPublicApi) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.AUTH;
    const redirectParam = encodeURIComponent(pathname + search);
    url.search = `?redirect=${redirectParam}`;
    return NextResponse.redirect(url);
  }

  // 5. Allow authorized request and attach diagnostic tracing headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-response-time", `${Date.now() - startTime}ms`);
  response.headers.set("x-powered-by", "OTP Shield Engine");

  return response;
}

/**
 * Configure which paths the proxy runs on.
 * Exclude static assets, Next.js internal files, favicon, etc.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
