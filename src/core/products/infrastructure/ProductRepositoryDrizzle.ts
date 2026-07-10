import { asc, eq } from "drizzle-orm";
import { getDb, categories, products } from "@/shared/lib/db";
import type { ProductRepository } from "../domain/repositories";
import type { Product, ProductInput } from "../domain/models";

const selectShape = {
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
  imageKey: products.imageKey,
} as const;

export class ProductRepositoryDrizzle implements ProductRepository {
  async list(categorySlug?: string): Promise<Product[]> {
    const db = getDb();
    const q = db
      .select(selectShape)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(asc(products.sortOrder));
    const rows = categorySlug
      ? await q.where(eq(categories.slug, categorySlug))
      : await q;
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const db = getDb();
    const rows = await db
      .select(selectShape)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async create(categoryId: string, input: ProductInput): Promise<Product> {
    const db = getDb();
    const [row] = await db
      .insert(products)
      .values({
        categoryId,
        name: input.name,
        description: input.description ?? "",
        price: input.price,
        unit: input.unit,
        emoji: input.emoji ?? "📦",
        gradient: input.gradient ?? "",
        imageKey: input.imageKey ?? null,
        available: input.isAvailable ?? true,
        highlighted: input.isHighlighted ?? false,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning({ id: products.id });
    const created = await this.findById(row.id);
    if (!created) throw new Error("product_creation_failed");
    return created;
  }

  async update(
    id: string,
    patch: Partial<Omit<ProductInput, "category">> & { categoryId?: string },
  ): Promise<Product | null> {
    const db = getDb();
    const values: Record<string, unknown> = {};
    if (patch.name !== undefined) values.name = patch.name;
    if (patch.description !== undefined) values.description = patch.description;
    if (patch.price !== undefined) values.price = patch.price;
    if (patch.unit !== undefined) values.unit = patch.unit;
    if (patch.emoji !== undefined) values.emoji = patch.emoji;
    if (patch.gradient !== undefined) values.gradient = patch.gradient;
    if (patch.imageKey !== undefined) values.imageKey = patch.imageKey;
    if (patch.isAvailable !== undefined) values.available = patch.isAvailable;
    if (patch.isHighlighted !== undefined) values.highlighted = patch.isHighlighted;
    if (patch.sortOrder !== undefined) values.sortOrder = patch.sortOrder;
    if (patch.categoryId !== undefined) values.categoryId = patch.categoryId;
    if (!Object.keys(values).length) return this.findById(id);
    const res = await db
      .update(products)
      .set(values)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    if (!res.length) return null;
    return this.findById(id);
  }

  async remove(id: string): Promise<{ removed: boolean; imageKey: string | null }> {
    const db = getDb();
    const existing = await db
      .select({ imageKey: products.imageKey })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing.length) return { removed: false, imageKey: null };
    await db.delete(products).where(eq(products.id, id));
    return { removed: true, imageKey: existing[0].imageKey };
  }

  async setImageKey(id: string, key: string | null): Promise<string | null> {
    const db = getDb();
    const existing = await db
      .select({ imageKey: products.imageKey })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing.length) return null;
    await db.update(products).set({ imageKey: key }).where(eq(products.id, id));
    return existing[0].imageKey;
  }
}

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  emoji: string;
  gradient: string;
  isAvailable: boolean;
  isHighlighted: boolean;
  sortOrder: number;
  imageKey: string | null;
};

function toDomain(row: ProductRow): Product {
  return { ...row };
}
