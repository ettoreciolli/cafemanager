import "server-only";

import { db } from "@cafemanager/db";

export function getMenuItemsWithIngredients() {
  return db.menuItem.findMany({
    orderBy: { name: "asc" },
    include: { ingredients: { include: { ingredient: true }, orderBy: { ingredient: { name: "asc" } } } },
  });
}