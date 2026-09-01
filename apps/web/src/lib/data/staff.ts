import "server-only";

import { db } from "@cafemanager/db";

export async function getStaff() {
  return await db.staff.findMany({ orderBy: { name: "asc" } });
}