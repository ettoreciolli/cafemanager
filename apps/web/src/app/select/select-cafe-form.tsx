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
import { cn } from "@/lib/utils";
import { selectCafe } from "@/lib/actions";

export function SelectCafeForm({
  cafes,
}: {
  cafes: { id: string; name: string; address: string }[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedId) return;
    setPending(true);
    try {
      const res = await selectCafe(selectedId);
      if (!res.ok) {
        toast.error(res.message ?? "Something went wrong.");
        return;
      }
      toast.success(res.message ?? "Cafe selected");
      router.push(`/${selectedId}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Choose a cafe</CardTitle>
        <CardDescription>Select the workspace you want to open.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            {cafes.map((cafe) => (
              <label
                key={cafe.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                  selectedId === cafe.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                )}
              >
                <input
                  type="radio"
                  name="cafe"
                  value={cafe.id}
                  checked={selectedId === cafe.id}
                  onChange={() => setSelectedId(cafe.id)}
                  className="size-4 accent-[--primary]"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium">{cafe.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{cafe.address}</span>
                </span>
              </label>
            ))}
          </div>
          <Button type="submit" disabled={!selectedId || pending} className="w-full">
            {pending ? "Opening..." : "Open cafe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}