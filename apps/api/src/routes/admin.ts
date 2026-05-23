import { and, asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { nanoid } from "nanoid";
import { z } from "zod";
import { categories, orders, products } from "@mercabana/db";
import { createDb } from "@mercabana/db/client";
import {
  categoryInputSchema,
  orderStatusSchema,
  productInputSchema,
} from "@mercabana/core";
import type { AppEnv } from "../env";

const idParam = z.object({ id: z.string().min(1) });

async function categoryIdBySlug(
  db: ReturnType<typeof createDb>,
  tenantId: string,
  slug: string,
): Promise<string | null> {
  const row = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.tenantId, tenantId), eq(categories.slug, slug)))
    .get();
  return row?.id ?? null;
}

export const adminRoutes = new Hono<AppEnv>()
  // categories
  .post("/categories", zValidator("json", categoryInputSchema), async (c) => {
    const input = c.req.valid("json");
    const tenant = c.get("tenant");
    const db = createDb(c.env.DB);
    const exists = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.tenantId, tenant.id), eq(categories.slug, input.slug)))
      .get();
    if (exists) return c.json({ error: "slug_in_use" }, 409);
    const id = `cat_${nanoid(10)}`;
    await db.insert(categories).values({
      id,
      tenantId: tenant.id,
      slug: input.slug,
      title: input.title,
      lead: input.lead ?? "",
      icon: input.icon,
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
    });
    return c.json({ id, slug: input.slug });
  })
  .patch(
    "/categories/:id",
    zValidator("param", idParam),
    zValidator("json", categoryInputSchema.partial()),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const tenant = c.get("tenant");
      const db = createDb(c.env.DB);
      const res = await db
        .update(categories)
        .set(input)
        .where(and(eq(categories.id, id), eq(categories.tenantId, tenant.id)))
        .run();
      if (res.meta.changes === 0) return c.json({ error: "not_found" }, 404);
      return c.json({ ok: true });
    },
  )
  .delete("/categories/:id", zValidator("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const tenant = c.get("tenant");
    const db = createDb(c.env.DB);
    const used = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.tenantId, tenant.id), eq(products.categoryId, id)))
      .get();
    if (used) return c.json({ error: "category_in_use" }, 409);
    const res = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenant.id)))
      .run();
    if (res.meta.changes === 0) return c.json({ error: "not_found" }, 404);
    return c.json({ ok: true });
  })

  // products
  .post("/products", zValidator("json", productInputSchema), async (c) => {
    const input = c.req.valid("json");
    const tenant = c.get("tenant");
    const db = createDb(c.env.DB);
    const categoryId = await categoryIdBySlug(db, tenant.id, input.category);
    if (!categoryId) return c.json({ error: "invalid_category" }, 400);
    const id = `p_${nanoid(12)}`;
    await db.insert(products).values({
      id,
      tenantId: tenant.id,
      categoryId,
      name: input.name,
      description: input.description ?? "",
      price: input.price,
      unit: input.unit,
      emoji: input.emoji ?? "📦",
      gradient: input.gradient ?? "",
      imageR2Key: input.imageR2Key ?? null,
      available: input.isAvailable ?? true,
      highlighted: input.isHighlighted ?? false,
      sortOrder: input.sortOrder ?? 0,
    });
    return c.json({ id });
  })
  .patch(
    "/products/:id",
    zValidator("param", idParam),
    zValidator("json", productInputSchema.partial()),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const tenant = c.get("tenant");
      const db = createDb(c.env.DB);

      const patch: Record<string, unknown> = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.description !== undefined) patch.description = input.description;
      if (input.price !== undefined) patch.price = input.price;
      if (input.unit !== undefined) patch.unit = input.unit;
      if (input.emoji !== undefined) patch.emoji = input.emoji;
      if (input.gradient !== undefined) patch.gradient = input.gradient;
      if (input.imageR2Key !== undefined) patch.imageR2Key = input.imageR2Key;
      if (input.isAvailable !== undefined) patch.available = input.isAvailable;
      if (input.isHighlighted !== undefined) patch.highlighted = input.isHighlighted;
      if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;
      if (input.category !== undefined) {
        const categoryId = await categoryIdBySlug(db, tenant.id, input.category);
        if (!categoryId) return c.json({ error: "invalid_category" }, 400);
        patch.categoryId = categoryId;
      }
      if (Object.keys(patch).length === 0) return c.json({ ok: true });

      const res = await db
        .update(products)
        .set(patch)
        .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
        .run();
      if (res.meta.changes === 0) return c.json({ error: "not_found" }, 404);
      return c.json({ ok: true });
    },
  )
  .delete("/products/:id", zValidator("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const tenant = c.get("tenant");
    const db = createDb(c.env.DB);
    const res = await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
      .run();
    if (res.meta.changes === 0) return c.json({ error: "not_found" }, 404);
    return c.json({ ok: true });
  })

  // orders (admin reads)
  .get("/orders", async (c) => {
    const tenant = c.get("tenant");
    const db = createDb(c.env.DB);
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.tenantId, tenant.id))
      .orderBy(desc(orders.createdAt));
    return c.json(rows);
  })
  .patch(
    "/orders/:id/status",
    zValidator("param", idParam),
    zValidator("json", z.object({ status: orderStatusSchema })),
    async (c) => {
      const { id } = c.req.valid("param");
      const { status } = c.req.valid("json");
      const tenant = c.get("tenant");
      const db = createDb(c.env.DB);
      const res = await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(orders.id, id), eq(orders.tenantId, tenant.id)))
        .run();
      if (res.meta.changes === 0) return c.json({ error: "not_found" }, 404);
      return c.json({ ok: true });
    },
  );
