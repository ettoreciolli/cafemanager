"use client";

import * as React from "react";
import { MinusIcon, PencilIcon, PlusIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createMenuItem, updateMenuItem } from "@/lib/actions";

type Ingredient = { id: string; name: string; unit: string };

export function MenuItemDialog({
  ingredients,
  item,
}: {
  ingredients: Ingredient[];
  item?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    available: boolean;
    imageUrl: string | null;
    ingredients: { ingredientId: string; quantity: number }[];
  };
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [available, setAvailable] = React.useState(item ? item.available : true);
  const [selected, setSelected] = React.useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    if (item) {
      for (const link of item.ingredients) init[link.ingredientId] = link.quantity;
    }
    return init;
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setAvailable(item ? item.available : true);
      const init: Record<string, number> = {};
      if (item) {
        for (const link of item.ingredients) init[link.ingredientId] = link.quantity;
      }
      setSelected(init);
    }
  }

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[id] = 1;
      else delete next[id];
      return next;
    });
  }

  function setQuantity(id: string, qty: number) {
    setSelected((prev) => ({ ...prev, [id]: qty }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const input = {
      name: String(form.get("name") ?? "").trim(),
      description: (form.get("description") as string) || null,
      price: Number(form.get("price") ?? 0),
      available,
      imageUrl: (form.get("imageUrl") as string) || null,
      ingredients: Object.entries(selected)
        .filter(([, qty]) => qty > 0)
        .map(([ingredientId, quantity]) => ({ ingredientId, quantity })),
    };

    if (!input.name || input.price <= 0) {
      toast.error("Name and a price greater than zero are required.");
      return;
    }

    setPending(true);
    const res = item
      ? await updateMenuItem(item.id, input)
      : await createMenuItem(input);
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
          <Button
            type="button"
            variant={item ? "ghost" : "outline"}
            size={item ? "icon-sm" : "default"}
          >
            {item ? (
              <PencilIcon className="size-4" />
            ) : (
              <>
                <PlusIcon className="size-4" /> Add item
              </>
            )}
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? `Edit ${item.name}` : "Add menu item"}</DialogTitle>
          <DialogDescription>
            Set the basics and link ingredients to track recipe costs.
          </DialogDescription>
        </DialogHeader>
        <form id="menuItemForm" onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required defaultValue={item?.name} placeholder="Cortado" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" required defaultValue={item?.price} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={item?.description ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" placeholder="https://..." defaultValue={item?.imageUrl ?? ""} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={available}
                  onCheckedChange={(checked) => setAvailable(Boolean(checked))}
                />
                Available
              </label>
            </div>

            {ingredients.length === 0 ? (
              <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                No ingredients yet — add some on the Ingredients page first.
              </p>
            ) : (
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border p-2">
                {ingredients.map((ing) => {
                  const active = selected[ing.id] !== undefined;
                  return (
                    <div key={ing.id} className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted">
                      <Checkbox
                        checked={active}
                        onCheckedChange={(checked) => toggle(ing.id, Boolean(checked))}
                        aria-label={ing.name}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {ing.name}
                        <span className="ml-1 text-xs text-muted-foreground">
                          per {ing.unit}
                        </span>
                      </span>
                      {active && (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setQuantity(ing.id, Math.max(0, (selected[ing.id] ?? 1) - 1))}
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="size-3" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            className="h-7 w-16 text-center"
                            value={selected[ing.id]}
                            onChange={(e) => setQuantity(ing.id, Number(e.target.value))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setQuantity(ing.id, (selected[ing.id] ?? 1) + 1)}
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit" form="menuItemForm" disabled={pending}>
            {pending ? "Saving..." : item ? "Save changes" : "Add item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}