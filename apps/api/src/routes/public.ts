import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { categories, createDb, products } from "@mercabana/db";
import type { AppEnv } from "../env";

export const publicRoutes = new Hono<AppEnv>()
  .get("/tenant", (c) => {
    return c.json(c.get("tenant"));
  })
  .get("/categories", async (c) => {
    const db = createDb(c.env.DB);
    const tenant = c.get("tenant");
    const rows = await db
      .select()
      .from(categories)
      .where(and(eq(categories.tenantId, tenant.id), eq(categories.active, true)))
      .orderBy(asc(categories.sortOrder));
    return c.json(rows);
  })
  .get("/products", async (c) => {
    const db = createDb(c.env.DB);
    const tenant = c.get("tenant");
    const categorySlug = c.req.query("category");

    if (categorySlug) {
      const cat = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.tenantId, tenant.id), eq(categories.slug, categorySlug)))
        .get();
      if (!cat) return c.json([]);
      const rows = await db
        .select()
        .from(products)
        .where(and(eq(products.tenantId, tenant.id), eq(products.categoryId, cat.id)))
        .orderBy(asc(products.sortOrder));
      return c.json(rows);
    }

    const rows = await db
      .select()
      .from(products)
      .where(eq(products.tenantId, tenant.id))
      .orderBy(asc(products.sortOrder));
    return c.json(rows);
  });
