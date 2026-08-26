import "server-only";

import { db } from "@cafemanager/db";

export function getDeliveries() {
  return db.delivery.findMany({
    orderBy: [{ scheduledAt: "desc" }],
    include: { ingredient: true, supplier: true },
  });
}