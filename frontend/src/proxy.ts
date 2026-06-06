import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/products", "/alerts", "/admin"];
const authPaths = ["/login", "/register"];

function safeReturnPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessCookie = process.env.AUTH_ACCESS_COOKIE_NAME ?? "pc_access_token";
  const refreshCookie =
    process.env.AUTH_REFRESH_COOKIE_NAME ?? "pc_refresh_token";
  const hasSession =
    request.cookies.has(accessCookie) || request.cookies.has(refreshCookie);

  if (
    protectedPrefixes.some((prefix) => path.startsWith(prefix)) &&
    !hasSession
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "returnTo",
      safeReturnPath(`${path}${request.nextUrl.search}`),
    );
    return NextResponse.redirect(loginUrl);
  }

  if (authPaths.includes(path) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/alerts/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
