import { db } from "@cafemanager/db";

import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatusSelect } from "@/components/status-select";
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
import { deleteOrder, updateOrderStatus } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { dateTime, money, number } from "@/lib/format";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = ["received", "preparing", "ready", "completed", "cancelled"];

export default async function OrdersPage() {
  await requireUser();

  const orders = await db.order.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { items: true },
  });

  const open = orders.filter((o) => ["received", "preparing", "ready"].includes(o.status)).length;
  const today = orders.filter((o) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return o.createdAt >= start;
  });
  const todayRevenue = today
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const secret = process.env.WEBHOOK_SECRET ?? "dev-secret";
  const app = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage incoming orders from your point-of-sale or the order simulator"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Orders in progress</CardDescription>
            <CardTitle className="text-2xl">{number(open)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Orders today</CardDescription>
            <CardTitle className="text-2xl">{number(today.length)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Revenue today</CardDescription>
            <CardTitle className="text-2xl">{money(todayRevenue)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All orders</CardTitle>
          <CardDescription>{orders.length} order{orders.length === 1 ? "" : "s"} received via webhook</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No orders yet. Your webhook endpoint is live at
              <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">{`${app}/api/webhook/orders`}</code>
              — point the order simulator (or your POS) at it:
              <code className="mt-2 block rounded bg-muted px-2 py-1.5 text-xs">
                bun ordersim --webhook {app}/api/webhook/orders --secret {secret} --count 15
              </code>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <span className="font-mono text-xs">{o.externalId ?? o.id.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell className="font-medium">{o.customerName ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex max-w-56 flex-col">
                        {o.items.map((item) => (
                          <span key={item.id} className="truncate text-sm text-muted-foreground">
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                        {o.items.length === 0 && <span className="text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>{money(o.total, o.currency)}</TableCell>
                    <TableCell className="text-muted-foreground">{o.source}</TableCell>
                    <TableCell className="text-muted-foreground">{dateTime(o.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={o.status} />
                        <StatusSelect
                          key={o.status}
                          action={updateOrderStatus}
                          id={o.id}
                          value={o.status}
                          options={ORDER_STATUSES}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DeleteButton
                          action={deleteOrder}
                          id={o.id}
                          label="Delete order"
                          confirm="Delete this order record?"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}