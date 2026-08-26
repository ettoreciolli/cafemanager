import "server-only";

import { db } from "@cafemanager/db";

export function getSuppliersWithIngredients() {
  return db.supplier.findMany({
    orderBy: { name: "asc" },
    include: { ingredients: { include: { ingredient: true }, orderBy: { ingredient: { name: "asc" } } } },
  });
}

export function getSupplierIngredientPairs() {
  return db.supplierIngredient.findMany({
    include: { supplier: true, ingredient: true },
    orderBy: { ingredient: { name: "asc" } },
  });
}