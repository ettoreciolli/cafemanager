"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    const error = params.get("error");
    if (error === "sso_unconfigured") {
      toast.error("Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to continue.");
    } else if (error === "oauth_failed") {
      toast.error("Google sign-in failed. Please try again.");
    } else if (error === "oauth_state") {
      toast.error("Google sign-in session expired. Please try again.");
    } else if (error === "oauth_no_email") {
      toast.error("Google did not return an email for your account.");
    }
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back to Cafe Manager</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {googleEnabled && (
          <>
            <Button variant="outline" className="w-full" render={<a href="/api/auth/google" />}>
              Continue with Google
            </Button>
            <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/register" className="font-medium text-foreground underline underline-offset-3 hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}