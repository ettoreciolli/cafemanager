import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/dal/auth";
import { getDashboardOrders, getIngredients, getDeliveries } from "@/dal";
import { dateTime, money, number } from "@/lib/format";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.hasOnboarded === false) {
    return redirect("/onboarding")
  }
  if (!user.selectedCafeId) {
    return redirect("/select")
  }
  const currency = user.currency;

  const [orders, ingredients, deliveries] = await Promise.all([
    getDashboardOrders(),
    getIngredients(),
    getDeliveries(),
  ]);

  // function orderCost(order: (typeof orders)[number]) {
  //   let cost = 0;
  //   for (const item of order.OrderItem) {
  //     if (!item.MenuItem) continue;
  //     for (const link of item.MenuItem.MenuItemIngredient) {
  //       cost += link.quantity * link.Ingredient * item.quantity;
  //     }
  //   }
  //   return cost;
  // }

  const valid = orders.filter((o) => o.status !== "cancelled");
  const revenue = valid.reduce((sum, o) => sum + o.total, 0);
  // const totalCost = orders.reduce((sum, o) => sum + orderCost(o), 0);
  // const profit = revenue - totalCost;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = valid.filter((o) => o.createdAt >= startOfDay);
  const todayRevenue = today.reduce((sum, o) => sum + o.total, 0);

  const avgOrder = valid.length ? revenue / valid.length : 0;
  const openOrders = orders.filter((o) =>
    ["received", "preparing", "ready"].includes(o.status)
  ).length;
  const lowStock = ingredients.filter((i) => i.stockQuantity <= i.minStock);
  const pendingDeliveries = deliveries.filter((d) =>
    ["scheduled", "in_transit"].includes(d.status)
  ).length;

  const byItem = new Map<string, number>();
  for (const o of orders) {
    for (const item of o.OrderItem) {
      byItem.set(item.name, (byItem.get(item.name) ?? 0) + item.quantity);
    }
  }
  const topItems = [...byItem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const metrics = [
    { label: "Today's sales", value: money(todayRevenue, currency), sub: `${today.length} orders today` },
    { label: "Total revenue", value: money(revenue, currency), sub: `${valid.length} orders all time` },
    // { label: "Estimated profit", value: money(profit, currency), sub: "revenue − ingredient costs" },
    { label: "Avg order value", value: money(avgOrder, currency), sub: "per non-cancelled order" },
    { label: "Orders in progress", value: number(openOrders), sub: "received / preparing / ready" },
    { label: "Low stock", value: number(lowStock.length), sub: `${pendingDeliveries} deliveries pending` },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A live view of your cafe's performance"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader>
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className="text-2xl">{m.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{m.sub}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest incoming orders</CardDescription>
            </div>
            <Link href="/orders" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No orders yet. Use the order simulator to generate some.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 8).map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">
                        {o.customerName ?? o.externalId ?? o.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{dateTime(o.createdAt)}</TableCell>
                      <TableCell>{money(o.total, currency)}</TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Low stock</CardTitle>
              <CardDescription>Ingredients at or below reorder point</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">All stocked up.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {lowStock.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{i.name}</span>
                        <span className="text-xs text-muted-foreground">
                          min {number(i.minStock)} {i.unit}
                        </span>
                      </div>
                      <span className="text-destructive font-medium">
                        {number(i.stockQuantity)} {i.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top items</CardTitle>
              <CardDescription>By units sold</CardDescription>
            </CardHeader>
            <CardContent>
              {topItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {topItems.map(([name, qty]) => (
                    <li key={name} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{name}</span>
                      <span className="text-muted-foreground">{number(qty)} sold</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}