import { db } from "@cafemanager/db";

import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
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
import { deleteSupplier } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { money, number } from "@/lib/format";

import { SupplierDialog } from "./supplier-form";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  await requireUser();

  const [suppliers, ingredients] = await Promise.all([
    db.supplier.findMany({
      orderBy: { name: "asc" },
      include: { ingredients: { include: { ingredient: true }, orderBy: { ingredient: { name: "asc" } } } },
    }),
    db.ingredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Who you buy ingredients from"
        action={<SupplierDialog ingredients={ingredients.map((i) => ({ id: i.id, name: i.name, unit: i.unit }))} />}
      />

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No suppliers yet. Add your first supplier.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
            <CardDescription>{suppliers.length} supplier{suppliers.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Ingredients supplied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <span className="font-medium">{s.name}</span>
                      {s.address && (
                        <span className="block text-xs text-muted-foreground">{s.address}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        {s.contact && <span className="text-muted-foreground">{s.contact}</span>}
                        {s.email && <span className="text-xs text-muted-foreground">{s.email}</span>}
                        {!s.contact && !s.email && <span className="text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.ingredients.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="flex max-w-72 flex-wrap gap-1">
                          {s.ingredients.map((offer) => (
                            <Badge key={offer.id} variant="secondary">
                              {offer.ingredient.name}
                              <span className="text-muted-foreground">
                                {" "}· {money(offer.price)}/{offer.ingredient.unit} · {number(offer.leadTimeDays)}d
                              </span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <DeleteButton
                          action={deleteSupplier}
                          id={s.id}
                          label={`Delete ${s.name}`}
                          confirm={`Delete "${s.name}"? Their ingredient offers and schedules will also be removed.`}
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