"use client";

import * as React from "react";
import { CalendarClockIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scheduleDelivery } from "@/lib/actions";

type Pair = {
  key: string;
  supplierId: string;
  supplierName: string;
  ingredientId: string;
  ingredientName: string;
  ingredientUnit: string;
};

function defaultScheduledAt() {
  const d = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DeliveryDialog({
  pairs,
  defaultPrices = {},
}: {
  pairs: Pair[];
  defaultPrices?: Record<string, number>;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [pairKey, setPairKey] = React.useState("");
  const [price, setPrice] = React.useState("");

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      const first = pairs[0]?.key ?? "";
      setPairKey(first);
      const def = pairs[0] ? defaultPrices[pairs[0].ingredientId] : undefined;
      setPrice(def === undefined ? "" : String(def));
    }
  }

  function selectPair(key: string) {
    setPairKey(key);
    const pair = pairs.find((p) => p.key === key);
    const def = pair ? defaultPrices[pair.ingredientId] : undefined;
    setPrice(def === undefined ? "" : String(def));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const pair = pairs.find((p) => p.key === pairKey);
    if (!pair) {
      toast.error("Pick a supplier + ingredient to schedule.");
      return;
    }

    const quantity = Number(form.get("quantity") ?? 0);
    const scheduledAt = String(form.get("scheduledAt") ?? "");
    const priceValue = Number(price);

    if (!scheduledAt || quantity <= 0) {
      toast.error("Quantity and delivery time are required.");
      return;
    }

    setPending(true);
    const res = await scheduleDelivery({
      supplierId: pair.supplierId,
      ingredientId: pair.ingredientId,
      quantity,
      scheduledAt: new Date(scheduledAt).toISOString(),
      status: "scheduled",
      price: priceValue,
    });
    setPending(false);

    if (res.ok) {
      toast.success(res.message ?? "Delivery scheduled");
      setOpen(false);
    } else {
      toast.error(res.message ?? "Failed to schedule delivery");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="default">
            <CalendarClockIcon className="size-4" /> Schedule delivery
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule delivery</DialogTitle>
          <DialogDescription>Plan an incoming delivery from a supplier you have ingredient agreements with.</DialogDescription>
        </DialogHeader>
        <form id="deliveryForm" onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Supplier / Ingredient</Label>
            <Select value={pairKey} onValueChange={(v) => selectPair(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pairs.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.supplierName} — {p.ingredientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min="0.001" step="any" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Unit price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scheduledAt">Scheduled for</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required defaultValue={defaultScheduledAt()} />
          </div>
          {pairKey && (
            <p className="text-xs text-muted-foreground">
              Pair selected: {pairs.find((p) => p.key === pairKey)?.ingredientName}
            </p>
          )}
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit" form="deliveryForm" disabled={pending}>
            {pending ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}