import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@cafemanager/db";

import { createSession } from "@/lib/data/auth";
import { appUrl, exchangeGoogleCode, fetchGoogleProfile } from "@/lib/oauth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const expected = store.get("google_oauth_state")?.value;
  store.delete("google_oauth_state");

  const base = appUrl();

  if (!code || !state || state !== expected) {
    return NextResponse.redirect(new URL("/login?error=oauth_state", base));
  }

  try {
    const token = await exchangeGoogleCode(code);
    if (!token.access_token) {
      return NextResponse.redirect(new URL("/login?error=oauth_failed", base));
    }

    const profile = await fetchGoogleProfile(token.access_token);
    const email = (profile.email ?? "").toLowerCase();
    if (!email) {
      return NextResponse.redirect(new URL("/login?error=oauth_no_email", base));
    }

    let user = await db.user.findUnique({ where: { googleId: profile.id } });

    if (!user) {
      const byEmail = await db.user.findUnique({ where: { email } });
      if (byEmail) {
        user = await db.user.update({ where: { id: byEmail.id }, data: { googleId: profile.id } });
      } else {
        user = await db.user.create({
          data: {
            email,
            name: profile.name ?? null,
            googleId: profile.id,
            provider: "google",
          },
        });
      }
    }

    await createSession(user.id);

    return NextResponse.redirect(new URL("/", base));
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", base));
  }
}