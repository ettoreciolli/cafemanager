import "server-only";

import { db } from "@cafemanager/db";

export function getOrdersWithItems() {
  return db.order.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { items: true },
  });
}

export function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

export function getOrderByExternalId(externalId: string) {
  return db.order.findUnique({ where: { externalId } });
}

export function getDashboardOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
    include: {
      items: {
        include: {
          menuItem: { include: { ingredients: { include: { ingredient: true } } } },
        },
      },
    },
  });
}