import { db } from "./index";

function cid(seed: string) {
  return "c" + seed.slice(0, 24).padEnd(24, "0");
}

async function main() {
  const ingredients = [
    { id: cid("coffee-beans"), name: "Coffee Beans", unit: "g", stockQuantity: 5000, minStock: 1000, costPerUnit: 0.02 },
    { id: cid("milk"), name: "Milk", unit: "ml", stockQuantity: 20000, minStock: 5000, costPerUnit: 0.001 },
    { id: cid("sugar"), name: "Sugar", unit: "g", stockQuantity: 10000, minStock: 2000, costPerUnit: 0.001 },
    { id: cid("flour"), name: "Flour", unit: "g", stockQuantity: 15000, minStock: 3000, costPerUnit: 0.001 },
  ];
  const suppliers = [
    { id: cid("roastery"), name: "Coffee Roastery Co.", contact: "orders@roastery.example" },
    { id: cid("dairy"), name: "Green Valley Dairy", contact: "sales@dairy.example" },
  ];
  const menuItems = [
    { id: cid("latte"), name: "Latte", price: 4.5, description: "Espresso + steamed milk" },
    { id: cid("flatwhite"), name: "Flat White", price: 4.0, description: "Double shot, silky microfoam" },
    { id: cid("croissant"), name: "Butter Croissant", price: 2.5, description: "Baked fresh daily" },
  ];

  for (const ing of ingredients) {
    await db.ingredient.upsert({ where: { id: ing.id }, update: ing, create: ing });
  }
  for (const sup of suppliers) {
    await db.supplier.upsert({ where: { id: sup.id }, update: sup, create: sup });
  }
  for (const item of menuItems) {
    await db.menuItem.upsert({ where: { id: item.id }, update: item, create: item });
  }

  const supplierLinks = [
    { supplierId: cid("roastery"), ingredientId: cid("coffee-beans"), price: 25, leadTimeDays: 2 },
    { supplierId: cid("dairy"), ingredientId: cid("milk"), price: 1.1, leadTimeDays: 1 },
    { supplierId: cid("dairy"), ingredientId: cid("flour"), price: 0.9, leadTimeDays: 1 },
  ];
  for (const link of supplierLinks) {
    await db.supplierIngredient.upsert({
      where: { supplierId_ingredientId: { supplierId: link.supplierId, ingredientId: link.ingredientId } },
      update: { price: link.price, leadTimeDays: link.leadTimeDays },
      create: link,
    });
  }

  const menuLinks = [
    { menuItemId: cid("latte"), ingredientId: cid("coffee-beans"), quantity: 18 },
    { menuItemId: cid("latte"), ingredientId: cid("milk"), quantity: 250 },
    { menuItemId: cid("flatwhite"), ingredientId: cid("coffee-beans"), quantity: 18 },
    { menuItemId: cid("flatwhite"), ingredientId: cid("milk"), quantity: 60 },
    { menuItemId: cid("croissant"), ingredientId: cid("flour"), quantity: 120 },
  ];
  for (const link of menuLinks) {
    await db.menuItemIngredient.upsert({
      where: { menuItemId_ingredientId: { menuItemId: link.menuItemId, ingredientId: link.ingredientId } },
      update: { quantity: link.quantity },
      create: link,
    });
  }

  console.log("Seeded cafe data.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });