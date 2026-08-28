"use client"

import { DeleteButton } from "@/components/delete-button";
import { StatusBadge } from "@/components/status-badge";
import { StatusSelect } from "@/components/status-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { OrderWithItems } from "@/dal";
import { updateOrderStatus, deleteOrder } from "@/lib/actions";
import { money, dateTime } from "@/lib/format";
import Link from "next/link";

type Props = {
  orders: OrderWithItems[], secret: string, appUrl: string, currency: string,
}

const ORDER_STATUSES = ["received", "preparing", "ready", "completed", "cancelled"];

export default function OrderDisplay({
  orders,
  secret,
  appUrl: app,
  currency,
}: Props) {
  return <Card>
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
                      <Link
                        href={`/orders/${o.id}`}
                        className="font-mono text-xs text-foreground hover:text-primary hover:underline"
                      >
                        {o.externalId ?? o.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{o.customerName ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex max-w-56 flex-col">
                        {o.OrderItem.map((item) => (
                          <span key={item.id} className="truncate text-sm text-muted-foreground">
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                        {o.OrderItem.length === 0 && <span className="text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>{money(o.total, currency)}</TableCell>
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
}

