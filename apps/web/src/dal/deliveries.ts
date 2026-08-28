import "server-only";

import { db } from "@cafemanager/db";

export function getDeliveries() {
  return db.delivery.findMany({
    orderBy: [{ scheduledAt: "desc" }],
    include: { Ingredient: true, Supplier: true },
  });
}

export async function getIngredientPrices(
  ingredientIds: string[]
): Promise<Record<string, number>> {
  if (ingredientIds.length === 0) return {};
  const deliveries = await db.delivery.findMany({
    where: { status: "delivered", ingredientId: { in: ingredientIds } },
    orderBy: { deliveredAt: "desc" },
    select: { ingredientId: true, price: true },
  });
  const latest = new Map<string, number>();
  for (const d of deliveries) {
    if (!latest.has(d.ingredientId)) latest.set(d.ingredientId, d.price);
  }
  return Object.fromEntries(latest);
}