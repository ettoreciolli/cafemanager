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
import { deleteMenuItem } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { money, number } from "@/lib/format";

import { MenuItemDialog } from "./menu-form";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  await requireUser();

  const [items, ingredients] = await Promise.all([
    db.menuItem.findMany({
      orderBy: { name: "asc" },
      include: { ingredients: { include: { ingredient: true }, orderBy: { ingredient: { name: "asc" } } } },
    }),
    db.ingredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Menu"
        description="Manage the items you sell and what goes into them"
        action={
          <MenuItemDialog
            key={`new-${items.length}`}
            ingredients={ingredients.map((i) => ({ id: i.id, name: i.name, unit: i.unit }))}
          />
        }
      />

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No menu items yet. Add your first item to get started.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Menu items</CardTitle>
            <CardDescription>{items.length} item{items.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Ingredients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{money(item.price)}</TableCell>
                    <TableCell>
                      {item.ingredients.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="line-clamp-2 max-w-60 text-muted-foreground">
                          {item.ingredients
                            .map((l) => `${number(l.quantity)} ${l.ingredient.unit} ${l.ingredient.name}`)
                            .join(", ")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.available ? "default" : "secondary"}>
                        {item.available ? "Available" : "Sold out"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <MenuItemDialog
                          item={{
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            available: item.available,
                            imageUrl: item.imageUrl,
                            ingredients: item.ingredients.map((l) => ({
                              ingredientId: l.ingredientId,
                              quantity: l.quantity,
                            })),
                          }}
                          ingredients={ingredients.map((i) => ({ id: i.id, name: i.name, unit: i.unit }))}
                        />
                        <DeleteButton
                          action={deleteMenuItem}
                          id={item.id}
                          label={`Delete ${item.name}`}
                          confirm={`Remove "${item.name}" from the menu?`}
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