import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic, cookie-presence-only check — no DB call, safe to run on
 * every request to these routes. This is not the real auth boundary: a
 * forged/expired cookie still passes here and gets caught by the actual
 * DB-backed session lookup (src/lib/session.ts) inside the page/route
 * itself. This layer exists only to stop anonymous users from ever
 * reaching the analyze flow, per the "no anonymous trial" decision.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/analyze", "/account"],
};
