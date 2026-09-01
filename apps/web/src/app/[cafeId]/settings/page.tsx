import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/dal/auth";
import { money } from "@/lib/format";

import { SettingsForm } from "./settings-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  if (user.hasOnboarded === false) {
    return redirect("/onboarding")
  }
  if (!user.selectedCafeId) {
    return redirect("/select")
  }
  const example = money(4.5, user.currency);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Preferences for your workspace"
      />
      <SettingsForm currency={user.currency} formatExample={example} />
    </>
  );
}