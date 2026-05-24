import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { categories, products } from "@mercabana/db";
import { createDb } from "@mercabana/db/client";
import type { CategoryDef, Product, Tenant } from "@mercabana/core";
import type { AppEnv } from "../env";

// Hasta la Fase 9 (R2), el editor admin guarda la imagen como data URL
// directamente en image_r2_key. Cuando migremos a R2 real, este campo
// pasará a contener una key tipo "tenants/frutas/products/uuid.jpg"
// y este helper construirá /r2/<key>.
function imageKeyToUrl(key: string | null): string | undefined {
  if (!key) return undefined;
  if (key.startsWith("data:") || key.startsWith("http")) return key;
  return `/r2/${key}`;
}

export const publicRoutes = new Hono<AppEnv>()
  .get("/tenant", (c) => {
    const t = c.get("tenant");
    const wire: Tenant = {
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      whatsappNumber: t.whatsappNumber,
      address: t.address,
      deliveryHours: t.deliveryHours,
      primaryColor: t.primaryColor,
      primaryColorDark: t.primaryColorDark,
      emoji: t.emoji,
    };
    return c.json(wire);
  })
  .get("/categories", async (c) => {
    const db = createDb(c.env.DB);
    const tenant = c.get("tenant");
    const rows = await db
      .select({
        id: categories.id,
        slug: categories.slug,
        title: categories.title,
        lead: categories.lead,
        icon: categories.icon,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(and(eq(categories.tenantId, tenant.id), eq(categories.active, true)))
      .orderBy(asc(categories.sortOrder));
    return c.json(rows satisfies CategoryDef[]);
  })
  .get("/products", async (c) => {
    const db = createDb(c.env.DB);
    const tenant = c.get("tenant");
    const categorySlug = c.req.query("category");

    const baseSelect = {
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      unit: products.unit,
      category: categories.slug,
      emoji: products.emoji,
      gradient: products.gradient,
      isAvailable: products.available,
      isHighlighted: products.highlighted,
      sortOrder: products.sortOrder,
      imageR2Key: products.imageR2Key,
    } as const;

    const where = categorySlug
      ? and(eq(products.tenantId, tenant.id), eq(categories.slug, categorySlug))
      : eq(products.tenantId, tenant.id);

    const rows = await db
      .select(baseSelect)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(asc(products.sortOrder));

    const wire: Product[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: r.price,
      unit: r.unit,
      category: r.category,
      emoji: r.emoji,
      gradient: r.gradient,
      isAvailable: r.isAvailable,
      isHighlighted: r.isHighlighted,
      sortOrder: r.sortOrder,
      imageUrl: imageKeyToUrl(r.imageR2Key),
    }));
    return c.json(wire);
  });
