"use client";

import * as React from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
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
import { createIngredient, updateIngredient } from "@/lib/actions";

export function IngredientDialog({
  ingredient,
}: {
  ingredient?: {
    id: string;
    name: string;
    unit: string;
    stockQuantity: number;
    minStock: number;
    costPerUnit: number;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const input = {
      name: String(form.get("name") ?? "").trim(),
      unit: String(form.get("unit") ?? "pcs").trim(),
      stockQuantity: Number(form.get("stockQuantity") ?? 0),
      minStock: Number(form.get("minStock") ?? 0),
      costPerUnit: Number(form.get("costPerUnit") ?? 0),
    };

    if (!input.name || !input.unit) {
      toast.error("Name and unit are required.");
      return;
    }

    setPending(true);
    const res = ingredient
      ? await updateIngredient(ingredient.id, input)
      : await createIngredient(input);
    setPending(false);

    if (res.ok) {
      toast.success(res.message ?? "Saved");
      setOpen(false);
    } else {
      toast.error(res.message ?? "Failed to save");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant={ingredient ? "ghost" : "outline"} size={ingredient ? "icon-sm" : "default"}>
            {ingredient ? (
              <PencilIcon className="size-4" />
            ) : (
              <>
                <PlusIcon className="size-4" /> Add ingredient
              </>
            )}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ingredient ? `Edit ${ingredient.name}` : "Add ingredient"}</DialogTitle>
          <DialogDescription>Track stock levels and the unit cost of each ingredient.</DialogDescription>
        </DialogHeader>
        <form id="ingredientForm" onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Whole milk" defaultValue={ingredient?.name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" required placeholder="ml | g | pcs" list="unitOpts" defaultValue={ingredient?.unit} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stockQuantity">Current stock</Label>
              <Input id="stockQuantity" name="stockQuantity" type="number" min="0" step="any" defaultValue={ingredient?.stockQuantity ?? 0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minStock">Reorder at</Label>
              <Input id="minStock" name="minStock" type="number" min="0" step="any" defaultValue={ingredient?.minStock ?? 0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="costPerUnit">Cost / unit</Label>
              <Input id="costPerUnit" name="costPerUnit" type="number" min="0" step="0.001" defaultValue={ingredient?.costPerUnit ?? 0} />
            </div>
          </div>
        </form>
        <datalist id="unitOpts">
          <option value="g" />
          <option value="ml" />
          <option value="pcs" />
          <option value="kg" />
          <option value="l" />
          <option value="dozen" />
        </datalist>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit" form="flexionForm" disabled={pending}>
            {pending ? "Saving..." : ingredient ? "Save changes" : "Add ingredient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}