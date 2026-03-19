import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSessionCookie(request: NextRequest) {
  return [
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
    "__Secure-authjs.session-token",
    "authjs.session-token"
  ].some((cookieName) => Boolean(request.cookies.get(cookieName)?.value));
}

export async function middleware(request: NextRequest) {
  const signInUrl = new URL("/auth/sign-in", request.url);
  signInUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const authenticated = hasSessionCookie(request);

  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/favorites") ||
    request.nextUrl.pathname.startsWith("/submit")
  ) {
    if (!authenticated) {
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/favorites/:path*", "/submit/:path*"]
};
