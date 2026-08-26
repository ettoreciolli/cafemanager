import "server-only";

import { db } from "@cafemanager/db";

export function getIngredients() {
  return db.ingredient.findMany({ orderBy: { name: "asc" } });
}

export function getIngredientsWithSuppliers() {
  return db.ingredient.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { menuItemLinks: true, supplierOffers: true } },
      supplierOffers: { include: { supplier: true } },
    },
  });
}