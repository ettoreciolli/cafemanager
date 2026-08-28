import "server-only";

import { db } from "@cafemanager/db";

export function getSuppliersWithIngredients() {
  return db.supplier.findMany({
    orderBy: { name: "asc" },
    include: { SupplierIngredient: { include: { Ingredient: true }, orderBy: { Ingredient: { name: "asc" } } } },
  });
}

export function getSupplierIngredientPairs() {
  return db.supplierIngredient.findMany({
    include: { Supplier: true, Ingredient: true },
    orderBy: { Ingredient: { name: "asc" } },
  });
}