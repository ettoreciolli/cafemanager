#!/usr/bin/env bun
/**
 * Cafe Manager order simulator.
 *
 * Sends realistic-looking orders to the webhook endpoint so you can exercise
 * the Orders page and Dashboard metrics. Orders are authenticated with a
 * bearer secret sent over HTTP.
 *
 * Usage:
 *   bun ordersim [flags]
 *
 * Flags:
 *   --webhook <url>     Webhook URL          (env: ORDERSIM_WEBHOOK_URL)
 *   --secret <string>   Bearer secret        (env: ORDERSIM_SECRET)
 *   --count <n>         Number of orders     (env: ORDERSIM_COUNT)
 *   --interval <ms>     Delay between orders (env: ORDERSIM_INTERVAL)
 *   --style <name>      steady | rush | wild
 *   --seed <n>          PRNG seed for reproducible orders
 *   --source <text>     Value stored in Order.source (default: sim)
 *   --menu <spec>       "Name:price,Name:price" or file:path to a JSON
 *                       array of { name, price } (defaults to cafe menu)
 *   --customers <list>  Comma-separated customer names
 *   --quiet             Only print the summary
 *   --help              Show this help
 */

type MenuItem = { name: string; price: number };
type Style = "steady" | "rush" | "wild";

import { readFileSync } from "node:fs";

const DEFAULT_MENU: MenuItem[] = [
  { name: "Espresso", price: 2.8 },
  { name: "Americano", price: 3.5 },
  { name: "Latte", price: 4.5 },
  { name: "Cappuccino", price: 4.2 },
  { name: "Flat White", price: 4.0 },
  { name: "Iced Latte", price: 5.0 },
  { name: "Mocha", price: 4.8 },
  { name: "Hot Chocolate", price: 3.8 },
  { name: "Croissant", price: 2.5 },
  { name: "Blueberry Muffin", price: 2.75 },
  { name: "Butter Bagel", price: 3.0 },
  { name: "Ham & Cheese Toastie", price: 5.5 },
];

const DEFAULT_CUSTOMERS = [
  "Ava", "Noah", "Olivia", "Liam", "Emma", "Mason", "Sophia",
  "Lucas", "Mia", "Ethan", "Isabella", "Leo", "Zoe", "Maya",
  "Kai", "Nora", "Finn", "Ivy", "Theo", "Ruby", "Aria", "Jude",
];

const STYLE_PRESETS: Record<Style, { items: [number, number]; qty: [number, number] }> = {
  steady: { items: [1, 3], qty: [1, 2] },
  rush: { items: [1, 4], qty: [1, 3] },
  wild: { items: [2, 6], qty: [1, 4] },
};

function printHelp() {
  console.log(`
Cafe Manager order simulator

Sends configurable orders to the webhook endpoint.

Flags:
  --webhook <url>     Webhook URL          (default: http://localhost:3000/api/webhook/orders)
  --secret <string>   Bearer secret        (default: dev-secret)
  --count <n>         Number of orders     (default: 10)
  --interval <ms>     Delay between orders (default: 2000)
  --style <name>      steady | rush | wild (default: steady)
  --seed <n>          PRNG seed
  --menu <spec>       "Name:price,Name:price" or file:path to a JSON array
  --customers <list>  Comma-separated names
  --quiet             Only print the summary
  --help              Show this help

Env overrides: ORDERSIM_WEBHOOK_URL, ORDERSIM_SECRET, ORDERSIM_COUNT,
ORDERSIM_INTERVAL, ORDERSIM_SEED.
`.trim());
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseMenuSpec(spec: string): MenuItem[] {
  if (spec.startsWith("file:")) {
    const raw = readFileSync(spec.slice(5), "utf8");
    return JSON.parse(raw) as MenuItem[];
  }
  return spec
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, priceStr] = part.split(":").map((s) => s.trim());
      return { name, price: Number(priceStr ?? 0) };
    });
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function between(rand: () => number, min: number, max: number) {
  return min + Math.floor(rand() * (max - min + 1));
}

async function sendOrder(webhookUrl: string, secret: string, order: Record<string, unknown>) {
  return fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
      "x-webhook-secret": secret,
    },
    body: JSON.stringify(order),
    signal: AbortSignal.timeout(10_000),
  });
}

function buildOrder(rand: () => number, index: number, config: {
  menu: MenuItem[];
  customers: string[];
  stylePreset: { items: [number, number]; qty: [number, number] };
  seedRaw: number;
  source: string;
}) {
  const { menu, customers, stylePreset, seedRaw, source } = config;
  const itemCount = between(rand, stylePreset.items[0], stylePreset.items[1]);

  const picked: { menuItem: MenuItem; quantity: number }[] = [];
  for (let j = 0; j < itemCount; j++) {
    const menuItem = menu[Math.floor(rand() * menu.length)];
    const quantity = between(rand, stylePreset.qty[0], stylePreset.qty[1]);
    const existing = picked.find((p) => p.menuItem.name === menuItem.name);
    if (existing) existing.quantity += quantity;
    else picked.push({ menuItem, quantity });
  }

  const total = picked.reduce((sum, p) => sum + p.menuItem.price * p.quantity, 0);
  const customer = customers[Math.floor(rand() * customers.length)];

  return {
    externalId: `sim-${seedRaw}-${index}-${Date.now()}`,
    customerName: customer,
    source,
    currency: "USD",
    status: "received",
    total: Math.round(total * 100) / 100,
    items: picked.map((p) => ({
      name: p.menuItem.name,
      quantity: p.quantity,
      unitPrice: p.menuItem.price,
    })),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const webhookUrl =
    args.webhook ?? process.env.ORDERSIM_WEBHOOK_URL ?? "http://localhost:3000/api/webhook/orders";
  const secret = args.secret ?? process.env.ORDERSIM_SECRET ?? "dev-secret";
  const count = Math.max(1, Number(args.count ?? process.env.ORDERSIM_COUNT ?? 10));
  const intervalMs = Math.max(
    0,
    Number(args.interval ?? process.env.ORDERSIM_INTERVAL ?? 2000)
  );
  const style = (args.style ?? "steady") as Style;
  const quiet = args.quiet === "true";
  const seedRaw = Number(args.seed ?? process.env.ORDERSIM_SEED ?? Math.floor(Math.random() * 1e9));
  const source = args.source ?? "sim";

  const menu = args.menu ? parseMenuSpec(args.menu) : DEFAULT_MENU;
  const customers = args.customers
    ? args.customers
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : DEFAULT_CUSTOMERS;

  const rand = mulberry32(seedRaw);
  const stylePreset = STYLE_PRESETS[style] ?? STYLE_PRESETS.steady;

  console.log(
    `Order simulator → ${webhookUrl}\n${count} orders, ~${intervalMs}ms apart, style=${style}, seed=${seedRaw}\n`
  );

  let ok = 0;
  let failed = 0;

  for (let i = 1; i <= count; i++) {
    const orderPayload = buildOrder(rand, i, {
      menu,
      customers,
      stylePreset,
      seedRaw,
      source,
    });

    try {
      const res = await sendOrder(webhookUrl, secret, orderPayload);
      if (res.ok) {
        ok++;
        if (!quiet) {
          const line = (orderPayload.items as { name: string; quantity: number }[])
            .map((p) => `${p.name} x${p.quantity}`)
            .join(", ");
          console.log(`  [${i}/${count}] ${line} → ${money(orderPayload.total)} (HTTP ${res.status})`);
        }
      } else {
        failed++;
        if (!quiet) {
          const text = await res.text();
          console.error(`  [${i}/${count}] HTTP ${res.status} — ${text}`);
        }
      }
    } catch (err) {
      failed++;
      if (!quiet) {
        console.error(
          `  [${i}/${count}] error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    if (i < count && intervalMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  console.log(`\nDone: ${ok} sent, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});