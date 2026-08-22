"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActionResult } from "@/lib/actions";

export function StatusSelect({
  action,
  id,
  value,
  options,
}: {
  action: (id: string, value: string) => Promise<ActionResult>;
  id: string;
  value: string;
  options: string[];
}) {
  const [current, setCurrent] = React.useState(value);
  const [pending, setPending] = React.useState(false);

  async function change(next: string | null) {
    if (!next || next === current) return;
    setPending(true);
    setCurrent(next);
    const res = await action(id, next);
    setPending(false);
    if (res.ok) {
      toast.success(res.message ?? "Status updated");
    } else {
      setCurrent(value);
      toast.error(res.message ?? "Failed to update status");
    }
  }

  return (
    <Select value={pending ? current : undefined} onValueChange={change}>
      <SelectTrigger size="sm">
        <SelectValue>{current.replace("_", " ")}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}