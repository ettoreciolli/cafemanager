import "server-only";

import { db } from "@cafemanager/db";

export async function getIngredients() {
  return await db.ingredient.findMany({ orderBy: { name: "asc" } });
}

export async function getIngredientsWithSuppliers() {
  return await db.ingredient.findMany({
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