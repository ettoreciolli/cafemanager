"use client";

import * as React from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/actions";

export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirm = "Delete this record? This cannot be undone.",
}: {
  action: (id: string) => Promise<ActionResult>;
  id: string;
  label?: string;
  confirm?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    setPending(true);
    const res = await action(id);
    setPending(false);
    if (res.ok) {
      toast.success(res.message ?? "Deleted");
    } else {
      toast.error(res.message ?? "Failed to delete");
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={label} />}
      >
        <Trash2Icon className="size-4 text-destructive" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{confirm}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}