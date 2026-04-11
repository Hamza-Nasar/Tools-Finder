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
  const signInUrl = new URL("/auth/login", request.url);
  signInUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const authenticated = hasSessionCookie(request);

  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/favorites") ||
    request.nextUrl.pathname.startsWith("/my-stack") ||
    request.nextUrl.pathname.startsWith("/submit")
  ) {
    if (!authenticated) {
      return NextResponse.redirect(signInUrl);
    }
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !authenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/favorites/:path*", "/my-stack/:path*", "/submit/:path*"]
};
