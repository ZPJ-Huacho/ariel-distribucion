import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { nanoid } from "nanoid";
import { orders } from "@mercabana/db";
import { createDb } from "@mercabana/db/client";
import { createOrderSchema } from "@mercabana/core";
import type { AppEnv } from "../env";

export const orderRoutes = new Hono<AppEnv>()
  .post("/", zValidator("json", createOrderSchema), async (c) => {
    const input = c.req.valid("json");
    const tenant = c.get("tenant");
    const user = c.get("user");
    const db = createDb(c.env.DB);

    const id = `ord_${nanoid(14)}`;
    const code = `PED-${Math.floor(2500 + Math.random() * 8000)}`;
    const total = input.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    await db.insert(orders).values({
      id,
      tenantId: tenant.id,
      userId: user?.id ?? null,
      code,
      status: "pending",
      source: input.source ?? "direct",
      total,
      items: input.items,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress ?? null,
      preferredTime: input.preferredTime ?? null,
      notes: input.notes ?? null,
    });

    return c.json({ id, code });
  })
  .get("/mine", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const db = createDb(c.env.DB);
    const rows = await db.select().from(orders).where(eq(orders.userId, user.id));
    return c.json(rows);
  });
