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
import { deleteIngredient } from "@/lib/actions";
import { requireUser } from "@/lib/data/auth";
import { getIngredientsWithSuppliers } from "@/lib/data";
import { money, number } from "@/lib/format";

import { IngredientDialog } from "./ingredient-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const user = await requireUser();
  if (user.hasOnboarded === false) {
    return redirect("/onboarding")
  }
  if (!user.selectedCafeId) {
    return redirect("/select")
  }
  const currency = user.currency;

  const ingredients = await getIngredientsWithSuppliers();

  return (
    <>
      <PageHeader
        title="Ingredients"
        description="Manage stock, costs, and which suppliers carry each ingredient"
        action={<IngredientDialog />}
      />

      {ingredients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No ingredients yet. Add your first ingredient.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>{ingredients.length} ingredient{ingredients.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Latest price</TableHead>
                  <TableHead>Suppliers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => {
                  const low = ing.stockQuantity <= ing.minStock;
                  const price = ing.Delivery.at(0)?.price
                  return (
                    <TableRow key={ing.id}>
                      <TableCell>
                        <span className="font-medium">{ing.name}</span>
                        <span className="ml-1 text-xs text-muted-foreground">({ing.unit})</span>
                      </TableCell>
                      <TableCell>
                        <span className={low ? "font-medium text-destructive" : ""}>
                          {number(ing.stockQuantity)} {ing.unit}
                        </span>
                        {low && <span className="ml-1.5"><Badge variant="destructive">low</Badge></span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {price ?? "Never delivered"}
                      </TableCell>
                      <TableCell>
                        {ing.SupplierIngredient.length === 0 ? (
                          <span className="text-muted-foreground">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {/* {ing.SupplierIngredient.map((o) => (
                              <Badge key={o.id} variant="secondary">{o.Supplier.name}</Badge>
                            ))} */}
                              {ing.SupplierIngredient.length}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <IngredientDialog
                            ingredient={{
                              id: ing.id,
                              name: ing.name,
                              unit: ing.unit,
                              stockQuantity: ing.stockQuantity,
                              minStock: ing.minStock,
                            }}
                          />
                          <DeleteButton
                            action={deleteIngredient}
                            id={ing.id}
                            label={`Delete ${ing.name}`}
                            confirm={`Delete "${ing.name}"? It will be removed from menus and delivery schedules.`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}