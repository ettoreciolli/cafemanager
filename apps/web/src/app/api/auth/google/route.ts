import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { appUrl, googleAuthorizationUrl, googleConfigured } from "@/lib/oauth";

export async function GET() {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=sso_unconfigured", appUrl()));
  }

  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(googleAuthorizationUrl(state));

  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return res;
}