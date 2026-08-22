import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { money } from "@/lib/format";

import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
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