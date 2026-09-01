import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

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
import { requireUser } from "@/lib/data/auth";
import { getOrderById } from "@/lib/data";
import { dateTime, money, number } from "@/lib/format";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = ["received", "preparing", "ready", "completed", "cancelled"];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  if (user.hasOnboarded === false) {
    return redirect("/onboarding")
  }
  if (!user.selectedCafeId) {
    return redirect("/select")
  }
  const currency = user.currency;

  const order = await getOrderById(id);

  if (!order) notFound();

  const itemTotal = order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <>
      <PageHeader
        title={`Order ${order.externalId ?? order.id.slice(0, 8)}`}
        description={dateTime(order.createdAt)}
        action={
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" /> Back to orders
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Customer</CardDescription>
            <CardTitle className="text-lg">
              {order.customerName ?? "Walk-in"}
            </CardTitle>
            {order.customerEmail && (
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <CardTitle className="flex items-center gap-2 text-lg">
              <StatusBadge status={order.status} />
              <StatusSelect
                key={order.status}
                action={updateOrderStatus}
                id={order.id}
                value={order.status}
                options={ORDER_STATUSES}
              />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>
            {number(order.items.reduce((s, i) => s + i.quantity, 0))} item
            {order.items.length === 1 ? "" : "s"} · source: {order.source} · order #
            {order.id.slice(0, 8)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{number(item.quantity)}</TableCell>
                  <TableCell className="text-right">
                    {money(item.unitPrice, currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {money(item.unitPrice * item.quantity, currency)}
                  </TableCell>
                </TableRow>
              ))}
              {order.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No line items on this order.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Placed {dateTime(order.createdAt)} · last updated {dateTime(order.updatedAt)}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Subtotal</div>
            <div className="text-sm">{money(itemTotal, currency)}</div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Total
            <div className="text-xl font-semibold text-foreground">
              {money(order.total, currency)}
            </div>
          </div>
          <DeleteButton
            action={deleteOrder}
            id={order.id}
            label="Delete order"
            confirm="Delete this order record?"
          />
        </div>
      </div>
    </>
  );
}