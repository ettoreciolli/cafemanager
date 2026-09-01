import { redirect } from "next/navigation";

import { requireUser } from "@/dal/auth";

import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.hasOnboarded) {
    redirect("/");
  }
  return <OnboardingForm />;
}