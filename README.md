# Cafe Manager



A demo full-stack web app for running a cafe: track orders, inventory, suppliers, deliveries, menu, and staff from a single dashboard.

Built with a [Turborepo](https://turborepo.com) monorepo — a Next.js dashboard app backed by a shared Prisma/Postgres database package.

## Disclaimer

This app is intended as a demo and has not been tested or deployed.

## What it does

- **Dashboard** — live revenue, profit, average order value, orders in progress, low-stock items, and top-selling items
- **Orders** — manage incoming orders, update status (`received → preparing → ready → completed / cancelled`), or delete them
- **Menu** — menu items with prices, descriptions, and availability
- **Ingredients** — inventory with stock levels, minimum reorder points, units, and unit cost
- **Suppliers** — suppliers and the price/lead time they offer for each ingredient
- **Deliveries** — scheduled deliveries of ingredients with status tracking
- **Staff** — staff roster with roles, hourly rates, and active status
- **Auth** — email/password sign-up and sign-in (bcrypt hashed), optional Google OAuth, and database-backed sessions
- **Order webhook** — an HTTP endpoint (`POST /api/webhook/orders`) for a point-of-sale system to push orders into the app
- **Order simulator** — a CLI that generates realistic orders and posts them to the webhook, so you can exercise the dashboard with real-looking data

## Tech stack

- **Monorepo**: Turborepo + [Bun](https://bun.sh) workspaces
- **Web app**: Next.js, React 19, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL via Prisma (`@cafemanager/db`)
- **Simulator**: standalone Bun script (`@cafemanager/ordersim`)

## Project structure

```
apps/
  web/              # Next.js dashboard app
packages/
  db/               # Shared Prisma client + schema + seed script
  ordersim/         # Order simulator CLI
```

## Prerequisites

- [Bun](https://bun.sh) `>= 1.3` (the repo pins `bun@1.3.14`)
- A PostgreSQL database (local or remote)

## Setup

### 1. Install dependencies

```sh
bun install
```

### 2. Configure the database

```sh
cp packages/db/.env.example packages/db/.env
```

Edit `packages/db/.env` and set a working `DATABASE_URL`, e.g.:

```sh
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cafemanager?schema=public
```

This file is read by the web app too — `next.config.ts` loads `DATABASE_URL` from it automatically, so you only set it once.

### 3. Create the schema and seed sample data

```sh
bun run db:push    # create tables from the Prisma schema
bun run seed       # insert sample ingredients, suppliers, menu items
```

### 4. Configure the web app

[`apps/web/.env.example`](apps/web/.env.example) lists the optional web-only variables. Copy it and fill in what you need:

| Variable            | Required | Purpose                                                |
| ------------------- | -------- | ------------------------------------------------------ |
| `APP_URL`           | no       | Base URL used for OAuth redirects (default `http://localhost:3000`) |
| `WEBHOOK_SECRET`    | no       | Auth secret for the order webhook (default `dev-secret`) |
| `GOOGLE_CLIENT_ID`  | no       | Enables Google sign-in (otherwise hidden)               |
| `GOOGLE_CLIENT_SECRET` | no    | Enables Google sign-in (otherwise hidden)               |

```sh
cp apps/web/.env.example apps/web/.env
```

`DATABASE_URL` is loaded from `packages/db/.env` — you do not need to set it here.

### 5. Run it

```sh
bun run dev        # starts every workspace (web + prisma watch)
```

Or just the web app:

```sh
bun run dev:web    # packages/db watch + the Next.js app
```

Open [http://localhost:3000](http://localhost:3000), create an account, and sign in.

## Generating demo orders

Once the app is running, fire the order simulator at the webhook (requires an account to already be seeded — the app itself must be up):

```sh
bun run sim
```

The root script posts 10 orders by default. Customize it directly:

```sh
bun ordersim --webhook http://localhost:3000/api/webhook/orders \
  --secret dev-secret \
  --count 15 \
  --interval 1000 \
  --style rush
```

See `bun ordersim --help` for all flags (traffic styles, customer lists, custom menus, PRNG seed for reproducibility).

## Webhook

The idea is that a POS would push an order to:

```
POST /api/webhook/orders
Authorization: Bearer <WEBHOOK_SECRET>
```

```json
{
  "externalId": "pos-123",
  "customerName": "Ava",
  "total": 9.0,
  "items": [
    { "name": "Latte", "quantity": 2, "unitPrice": 4.5 }
  ]
}
```

Orders referencing an existing `externalId` are treated as duplicates and skipped.

## Scripts

Run from the repo root:

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `bun run dev`      | Start all dev workspaces                     |
| `bun run dev:web`  | Start the web app (+ Prisma watch)           |
| `bun run build`    | Build all workspaces                         |
| `bun run lint`     | Lint all workspaces                          |
| `bun run typecheck`| Type-check all workspaces                    |
| `bun run sim`      | Run the order simulator (default settings)   |
| `bun run seed`     | Seed sample cafe data                        |
| `bun run db:push`  | Push the Prisma schema to the database       |
| `bun run db:generate` | Regenerate the Prisma client             |
| `bun run clean`    | Remove build artifacts                       |

## License

[MIT](LICENSE)
