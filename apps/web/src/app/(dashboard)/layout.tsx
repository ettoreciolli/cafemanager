import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth";

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

  return (
    <AppShell userName={session.user.name ?? session.user.email}>
      {children}
    </AppShell>
  );
}