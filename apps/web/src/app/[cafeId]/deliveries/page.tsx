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
import { deleteDelivery, updateDeliveryStatus } from "@/lib/actions";
import { requireUser } from "@/dal/auth";
import { getDeliveries, getSupplierIngredientPairs, getIngredientPrices } from "@/dal";
import { dateTime, number } from "@/lib/format";

import { DeliveryDialog } from "./delivery-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const DELIVERY_STATUSES = ["scheduled", "in_transit", "delivered", "cancelled"];

export default async function DeliveriesPage() {
  const user = await requireUser();
  if (user.hasOnboarded === false) {
    return redirect("/onboarding")
  }
  if (!user.selectedCafeId) {
    return redirect("/select")
  }

  const deliveries = await getDeliveries();

  const pairs = await getSupplierIngredientPairs();

  const pairOptions = pairs.map((p) => ({
    key: `${p.supplierId}:${p.ingredientId}`,
    supplierId: p.supplierId,
    supplierName: p.Supplier.name,
    ingredientId: p.ingredientId,
    ingredientName: p.Ingredient.name,
    ingredientUnit: p.Ingredient.unit,
  }));

  const ingredientIds = pairOptions.map((p) => p.ingredientId);
  const defaultPrices = await getIngredientPrices(ingredientIds);

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="Schedule and track ingredient deliveries from suppliers"
        action={<DeliveryDialog pairs={pairOptions} defaultPrices={defaultPrices} />}
      />

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No deliveries scheduled yet. First link a supplier to an ingredient, then schedule one.
            {pairs.length === 0 && " You need supplier → ingredient agreements (add them on the Suppliers page)."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>{deliveries.length} delivery record{deliveries.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      {d.Ingredient.name}
                      <span className="ml-1 text-xs text-muted-foreground">({d.Ingredient.unit})</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.Supplier.name}</TableCell>
                    <TableCell>{number(d.quantity)} {d.Ingredient.unit}</TableCell>
                    <TableCell className="text-muted-foreground">{dateTime(d.scheduledAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{d.deliveredAt ? dateTime(d.deliveredAt) : "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={d.status} />
                        <StatusSelect
                          key={d.status}
                          action={updateDeliveryStatus}
                          id={d.id}
                          value={d.status}
                          options={DELIVERY_STATUSES}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DeleteButton
                          action={deleteDelivery}
                          id={d.id}
                          label="Delete delivery"
                          confirm="Delete this delivery record?"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}