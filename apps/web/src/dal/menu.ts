import "server-only";

import { db } from "@cafemanager/db";

export function getMenuItemsWithIngredients() {
  return db.menuItem.findMany({
    orderBy: { name: "asc" },
    include: { MenuItemIngredient: { include: { Ingredient: true }, orderBy: { Ingredient: { name: "asc" } } } },
  });
}