"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";
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
import { createSupplier } from "@/lib/actions";

type Ingredient = { id: string; name: string; unit: string };
type Offer = { ingredientId: string; price: number; leadTimeDays: number };

export function SupplierDialog({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [selected, setSelected] = React.useState<Record<string, Offer>>({});

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setSelected({});
  }

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[id] = { ingredientId: id, price: 0, leadTimeDays: 1 };
      else delete next[id];
      return next;
    });
  }

  function setOffer(id: string, patch: Partial<Offer>) {
    setSelected((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch, ingredientId: id },
    }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const input = {
      name: String(form.get("name") ?? "").trim(),
      contact: (form.get("contact") as string) || null,
      email: (form.get("email") as string) || null,
      address: (form.get("address") as string) || null,
      offers: Object.values(selected),
    };

    if (!input.name) {
      toast.error("Supplier name is required.");
      return;
    }

    setPending(true);
    const res = await createSupplier(input);
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
          <Button type="button" variant="outline" size="default">
            <PlusIcon className="size-4" /> Add supplier
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add supplier</DialogTitle>
          <DialogDescription>Record contact details and the ingredients this supplier can deliver.</DialogDescription>
        </DialogHeader>
        <form id="supplierForm" onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Green Valley Dairy" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact">Contact</Label>
              <Input id="contact" name="contact" placeholder="Phone or person" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="sales@supplier.com" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Market St" />
          </div>

          <div className="flex flex-col gap-3">
            <Label>Ingredients supplied</Label>
            {ingredients.length === 0 ? (
              <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                No ingredients yet — add some on the Ingredients page first.
              </p>
            ) : (
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border p-2">
                {ingredients.map((ing) => {
                  const active = Boolean(selected[ing.id]);
                  return (
                    <div key={ing.id} className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted">
                      <Checkbox
                        checked={active}
                        onCheckedChange={(checked) => toggle(ing.id, Boolean(checked))}
                        aria-label={ing.name}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {ing.name}
                        <span className="ml-1 text-xs text-muted-foreground">per {ing.unit}</span>
                      </span>
                      {active && (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            className="h-7 w-20 text-right"
                            placeholder="price"
                            value={selected[ing.id].price || ""}
                            onChange={(e) => setOffer(ing.id, { price: Number(e.target.value) })}
                            aria-label={`${ing.name} price`}
                          />
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            className="h-7 w-16 text-center"
                            placeholder="days"
                            value={selected[ing.id].leadTimeDays}
                            onChange={(e) => setOffer(ing.id, { leadTimeDays: Number(e.target.value) })}
                            aria-label={`${ing.name} lead time`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {Object.keys(selected).length > 0 && (
              <p className="text-xs text-muted-foreground">
                Price shown is per unit; lead time in business days.
              </p>
            )}
          </div>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit" form="supplierForm" disabled={pending}>
            {pending ? "Saving..." : "Add supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}