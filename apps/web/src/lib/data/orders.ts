import "server-only";

import { db } from "@cafemanager/db";

export async function getOrdersWithItems() {
  return await db.order.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { OrderItem: true },
  });
}

export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { OrderItem: true },
  });
}

export async function getOrderByExternalId(externalId: string) {
  return db.order.findUnique({ where: { externalId } });
}

export async function getDashboardOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
    include: {
      OrderItem: {
        include: {
          MenuItem: { include: { MenuItemIngredient: { include: { Ingredient: true } } } },
        },
      },
    },
  });
}

export type OrderWithItems = Awaited<ReturnType<typeof getOrdersWithItems>>[number]