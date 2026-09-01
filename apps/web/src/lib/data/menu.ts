import "server-only";

import { db } from "@cafemanager/db";

export async function getMenuItemsWithIngredients() {
  return await db.menuItem.findMany({
    orderBy: { name: "asc" },
    include: { MenuItemIngredient: { include: { Ingredient: true }, orderBy: { Ingredient: { name: "asc" } } } },
  });
}