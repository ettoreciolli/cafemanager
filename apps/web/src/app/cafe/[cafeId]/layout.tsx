import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/data/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!session.User.selectedCafeId) {
    redirect("/select")
  }

  return (
    <AppShell userName={session.User.name ?? session.User.email} cafeId={session.User.selectedCafeId}>
      {children}
    </AppShell>
  );
}