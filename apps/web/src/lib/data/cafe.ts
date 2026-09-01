import "server-only";

import { db } from "@cafemanager/db";

export async function getOwnedCafes(userId: string) {
  return await db.cafe.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });
}