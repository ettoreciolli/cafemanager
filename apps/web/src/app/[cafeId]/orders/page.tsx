import Link from "next/link";

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
import { requireUser } from "@/dal/auth";
import { getOrdersWithItems } from "@/dal";
import { dateTime, money, number } from "@/lib/format";
import OrderDisplay from "./OrderDisplay";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";



export default async function OrdersPage() {
  const user = await requireUser();
  if (user.hasOnboarded === false) {
    return redirect("/onboarding")
  }
  if (!user.selectedCafeId) {
    return redirect("/select")
  }
  const currency = user.currency;

  const orders = await getOrdersWithItems();

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
            <CardTitle className="text-2xl">{money(todayRevenue, currency)}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <OrderDisplay orders={orders} secret={secret} currency={currency} appUrl={app} />

      
    </>
  );
}