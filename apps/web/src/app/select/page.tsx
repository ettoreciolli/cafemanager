import { redirect } from "next/navigation";

import { requireUser } from "@/lib/data/auth";
import { getOwnedCafes } from "@/lib/data";

import { SelectCafeForm } from "./select-cafe-form";

export const dynamic = "force-dynamic";

export default async function SelectPage() {
  const user = await requireUser();
  if (!user.hasOnboarded) {
    redirect("/onboarding");
  }
  if (user.selectedCafeId) {
    redirect(`/cafe/${user.selectedCafeId}/dashboard`);
  }

  const cafes = await getOwnedCafes(user.id);
  if (cafes.length === 0) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 p-4">
      <SelectCafeForm cafes={cafes} />
    </div>
  );
}