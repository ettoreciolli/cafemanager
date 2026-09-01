import { db } from "@cafemanager/db";
import { getOrderByExternalId } from "@/lib/data";
import { revalidatePath } from "next/cache";

type IncomingItem = {
  name: string;
  quantity?: number;
  unitPrice?: number;
  menuItemId?: string;
};

type IncomingOrder = {
  externalId?: string;
  customerName?: string;
  customerEmail?: string;
  status?: string;
  currency?: string;
  source?: string;
  total?: number;
  items?: IncomingItem[];
};

const secret = process.env.WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (secret) {
    const authorization = req.headers.get("authorization") ?? "";
    const headerSecret = req.headers.get("x-webhook-secret");
    if (authorization !== `Bearer ${secret}` && headerSecret !== secret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: IncomingOrder;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.items || body.items.length === 0) {
    return Response.json({ error: "items is required and must not be empty" }, { status: 400 });
  }

  if (body.externalId) {
    const existing = await getOrderByExternalId(body.externalId);
    if (existing) {
      return Response.json({ ok: true, id: existing.id, duplicate: true });
    }
  }

  const items = body.items.map((item) => ({
    menuItemId: item.menuItemId ?? null,
    name: item.name,
    quantity: item.quantity ?? 1,
    unitPrice: item.unitPrice ?? 0,
  }));

  const total =
    typeof body.total === "number"
      ? body.total
      : items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const order = await db.order.create({
    data: {
      externalId: body.externalId ?? null,
      customerName: body.customerName ?? null,
      customerEmail: body.customerEmail ?? null,
      status: body.status ?? "received",
      total,
      currency: body.currency ?? "USD",
      source: body.source ?? "webhook",
      items: { create: items },
    },
    include: { items: true },
  });

  return Response.json({ ok: true, id: order.id }, { status: 201 });
}