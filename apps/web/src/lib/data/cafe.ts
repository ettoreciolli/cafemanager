import "server-only";

import { db } from "@cafemanager/db";

export function getOwnedCafes(userId: string) {
  return db.cafe.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });
}