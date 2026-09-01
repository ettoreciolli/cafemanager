"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { completeOnboarding } from "@/lib/actions";

export function OnboardingForm() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    setPending(true);
    try {
      const res = await completeOnboarding({
        name: String(form.get("name") ?? ""),
        address: String(form.get("address") ?? ""),
        description: String(form.get("description") ?? ""),
        phone: form.get("phone") ? String(form.get("phone")) : null,
      });
      if (!res.ok) {
        toast.error(res.message ?? "Something went wrong.");
        return;
      }
      toast.success(res.message ?? "Workspace ready!");
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
        <CardTitle>Set up your cafe</CardTitle>
        <CardDescription>
          Tell us about your workspace to get the dashboard ready.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Cafe name</Label>
            <Input id="name" name="name" required autoComplete="organization" placeholder="Jane&apos;s Cafe" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" required autoComplete="street-address" placeholder="221B Baker Street" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="A cozy neighborhood spot for coffee and pastries"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 555-0100" />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Setting up..." : "Create workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}