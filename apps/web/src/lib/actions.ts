"use server";

import { revalidatePath } from "next/cache";

import { db } from "@cafemanager/db";

import { requireUser } from "@/lib/auth";

export type ActionResult = { ok: boolean; message?: string };

// ---------- Settings ----------

export async function updateCurrency(currency: string): Promise<ActionResult> {
  const user = await requireUser();
  const code = currency.toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    return { ok: false, message: "Invalid currency code." };
  }
  await db.user.update({ where: { id: user.id }, data: { currency: code } });
  revalidateAll();
  return { ok: true, message: `Currency set to ${code}` };
}

const REVALIDATE_ALL = ["/", "/menu", "/ingredients", "/suppliers", "/deliveries", "/orders", "/staff"];

function revalidateAll() {
  for (const p of REVALIDATE_ALL) revalidatePath(p);
}

// ---------- Ingredients ----------

export async function createIngredient(input: {
  name: string;
  unit: string;
  stockQuantity: number;
  minStock: number;
  costPerUnit: number;
}): Promise<ActionResult> {
  await requireUser();
  await db.ingredient.create({
    data: {
      name: input.name,
      unit: input.unit,
      stockQuantity: input.stockQuantity,
      minStock: input.minStock,
      costPerUnit: input.costPerUnit,
    },
  });
  revalidateAll();
  return { ok: true, message: `Added ingredient ${input.name}` };
}

export async function updateIngredient(
  id: string,
  input: {
    name: string;
    unit: string;
    stockQuantity: number;
    minStock: number;
    costPerUnit: number;
  }
): Promise<ActionResult> {
  await requireUser();
  await db.ingredient.update({
    where: { id },
    data: {
      name: input.name,
      unit: input.unit,
      stockQuantity: input.stockQuantity,
      minStock: input.minStock,
      costPerUnit: input.costPerUnit,
    },
  });
  revalidateAll();
  return { ok: true, message: `Updated ${input.name}` };
}

export async function deleteIngredient(id: string): Promise<ActionResult> {
  await requireUser();
  await db.ingredient.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

// ---------- Menu ----------

export async function createMenuItem(input: {
  name: string;
  description?: string | null;
  price: number;
  available: boolean;
  imageUrl?: string | null;
  ingredients: { ingredientId: string; quantity: number }[];
}): Promise<ActionResult> {
  await requireUser();
  const item = await db.menuItem.create({
    data: {
      name: input.name,
      description: input.description || null,
      price: input.price,
      available: input.available,
      imageUrl: input.imageUrl || null,
      ingredients: {
        create: input.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
        })),
      },
    },
  });
  revalidateAll();
  return { ok: true, message: `Added ${item.name} to the menu` };
}

export async function updateMenuItem(
  id: string,
  input: {
    name: string;
    description?: string | null;
    price: number;
    available: boolean;
    imageUrl?: string | null;
    ingredients: { ingredientId: string; quantity: number }[];
  }
): Promise<ActionResult> {
  await requireUser();
  await db.$transaction(async (tx) => {
    await tx.menuItemIngredient.deleteMany({ where: { menuItemId: id } });
    await tx.menuItem.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description || null,
        price: input.price,
        available: input.available,
        imageUrl: input.imageUrl || null,
        ingredients: {
          create: input.ingredients.map((i) => ({
            ingredientId: i.ingredientId,
            quantity: i.quantity,
          })),
        },
      },
    });
  });
  revalidateAll();
  return { ok: true, message: `Updated ${input.name}` };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  await requireUser();
  await db.menuItem.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

// ---------- Suppliers ----------

export async function createSupplier(input: {
  name: string;
  contact?: string | null;
  email?: string | null;
  address?: string | null;
  offers: { ingredientId: string; price: number; leadTimeDays: number }[];
}): Promise<ActionResult> {
  await requireUser();
  const supplier = await db.supplier.create({
    data: {
      name: input.name,
      contact: input.contact || null,
      email: input.email || null,
      address: input.address || null,
      ingredients: {
        create: input.offers.map((o) => ({
          ingredientId: o.ingredientId,
          price: o.price,
          leadTimeDays: o.leadTimeDays,
        })),
      },
    },
  });
  revalidateAll();
  return { ok: true, message: `Added supplier ${supplier.name}` };
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  await requireUser();
  await db.supplier.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

// ---------- Deliveries ----------

export async function scheduleDelivery(input: {
  supplierId: string;
  ingredientId: string;
  quantity: number;
  scheduledAt: string; // ISO datetime
  status?: string;
  price?: number;
}): Promise<ActionResult> {
  await requireUser();
  const delivery = await db.delivery.create({
    data: {
      supplierId: input.supplierId,
      ingredientId: input.ingredientId,
      quantity: input.quantity,
      scheduledAt: new Date(input.scheduledAt),
      status: input.status ?? "scheduled",
      price: input.price ?? 0,
    },
  });
  revalidateAll();
  return { ok: true, message: `Scheduled delivery ${delivery.id.slice(0, 8)}` };
}

export async function updateDeliveryStatus(id: string, status: string): Promise<ActionResult> {
  await requireUser();
  await db.delivery.update({
    where: { id },
    data: {
      status,
      deliveredAt: status === "delivered" ? new Date() : null,
    },
  });
  revalidateAll();
  return { ok: true };
}

export async function deleteDelivery(id: string): Promise<ActionResult> {
  await requireUser();
  await db.delivery.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

// ---------- Orders ----------

export async function updateOrderStatus(id: string, status: string): Promise<ActionResult> {
  await requireUser();
  await db.order.update({ where: { id }, data: { status } });
  revalidateAll();
  return { ok: true };
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  await requireUser();
  await db.order.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

// ---------- Staff ----------

export async function createStaffMember(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  hourlyRate: number;
  active: boolean;
}): Promise<ActionResult> {
  await requireUser();
  await db.staff.create({
    data: {
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      role: input.role,
      hourlyRate: input.hourlyRate,
      active: input.active,
    },
  });
  revalidateAll();
  return { ok: true, message: `Added staff member ${input.name}` };
}

export async function updateStaffMember(
  id: string,
  input: {
    name: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    hourlyRate: number;
    active: boolean;
  }
): Promise<ActionResult> {
  await requireUser();
  await db.staff.update({
    where: { id },
    data: {
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      role: input.role,
      hourlyRate: input.hourlyRate,
      active: input.active,
    },
  });
  revalidateAll();
  return { ok: true, message: `Updated ${input.name}` };
}

export async function deleteStaffMember(id: string): Promise<ActionResult> {
  await requireUser();
  await db.staff.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}