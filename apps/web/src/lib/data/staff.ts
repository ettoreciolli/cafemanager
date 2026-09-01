import "server-only";

import { db } from "@cafemanager/db";

export function getStaff() {
  return db.staff.findMany({ orderBy: { name: "asc" } });
}