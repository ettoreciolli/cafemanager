import "server-only";

import { db } from "@cafemanager/db";

export function getIngredients() {
  return db.ingredient.findMany({ orderBy: { name: "asc" } });
}

export function getIngredientsWithSuppliers() {
  return db.ingredient.findMany({
    orderBy: { name: "asc" },
    include: {
      Delivery: {
        select: { price: true },
        take: 1
      },
      SupplierIngredient: {
        select: {
          Supplier: {
            select: {
              name: true
            }
          },
          id: true
        }
      }
    },
  });
}

export type IngredientData = Awaited<ReturnType<typeof getIngredientsWithSuppliers>>[number]