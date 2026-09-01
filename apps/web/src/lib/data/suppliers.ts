import "server-only";

import { db } from "@cafemanager/db";

export async function getSuppliersWithIngredients() {
  return await db.supplier.findMany({
    orderBy: { name: "asc" },
    include: { SupplierIngredient: { include: { Ingredient: true }, orderBy: { Ingredient: { name: "asc" } } } },
  });
}

export async function getSupplierIngredientPairs() {
  return await db.supplierIngredient.findMany({
    include: { Supplier: true, Ingredient: true },
    orderBy: { Ingredient: { name: "asc" } },
  });
}