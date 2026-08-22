"use client";

import * as React from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStaffMember, updateStaffMember } from "@/lib/actions";

const ROLES = ["barista", "cook", "cashier", "manager", "hygiene", "other"];

export function StaffDialog({
  member,
}: {
  member?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    hourlyRate: number;
    active: boolean;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [active, setActive] = React.useState(member ? member.active : true);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setActive(member ? member.active : true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const input = {
      name: String(form.get("name") ?? "").trim(),
      email: (form.get("email") as string) || null,
      phone: (form.get("phone") as string) || null,
      role: String(form.get("role") ?? "staff"),
      hourlyRate: Number(form.get("hourlyRate") ?? 0),
      active,
    };

    if (!input.name) {
      toast.error("Name is required.");
      return;
    }

    setPending(true);
    const res = member
      ? await updateStaffMember(member.id, input)
      : await createStaffMember(input);
    setPending(false);

    if (res.ok) {
      toast.success(res.message ?? "Saved");
      setOpen(false);
    } else {
      toast.error(res.message ?? "Failed to save");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant={member ? "ghost" : "outline"} size={member ? "icon-sm" : "default"}>
            {member ? (
              <PencilIcon className="size-4" />
            ) : (
              <>
                <PlusIcon className="size-4" /> Add staff member
              </>
            )}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? `Edit ${member.name}` : "Add staff member"}</DialogTitle>
          <DialogDescription>Track your team, their roles and hourly pay.</DialogDescription>
        </DialogHeader>
        <form id="staffForm" onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Alex Morgan" defaultValue={member?.name} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={member?.email ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={member?.phone ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select name="role" defaultValue={member?.role ?? ROLES[0]}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hourlyRate">Hourly rate</Label>
              <Input id="hourlyRate" name="hourlyRate" type="number" min="0" step="0.01" defaultValue={member?.hourlyRate ?? 0} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={active} onCheckedChange={(checked) => setActive(Boolean(checked))} />
            Active on the team
          </label>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit" form="staffForm" disabled={pending}>
            {pending ? "Saving..." : member ? "Save changes" : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}