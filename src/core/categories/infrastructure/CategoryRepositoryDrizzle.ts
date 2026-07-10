import { and, asc, eq } from "drizzle-orm";
import { getDb, categories, products } from "@/shared/lib/db";
import type { CategoryRepository } from "../domain/repositories";
import type { Category, CategoryInput } from "../domain/models";

export class CategoryRepositoryDrizzle implements CategoryRepository {
  async listActive(): Promise<Category[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.active, true))
      .orderBy(asc(categories.sortOrder));
    return rows.map(toDomain);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async create(input: CategoryInput): Promise<Category> {
    const db = getDb();
    const [row] = await db
      .insert(categories)
      .values({
        slug: input.slug,
        title: input.title,
        lead: input.lead ?? "",
        icon: input.icon,
        sortOrder: input.sortOrder ?? 0,
        active: input.active ?? true,
      })
      .returning();
    return toDomain(row);
  }

  async update(id: string, patch: Partial<CategoryInput>): Promise<Category | null> {
    const db = getDb();
    if (!Object.keys(patch).length) {
      const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
      return rows[0] ? toDomain(rows[0]) : null;
    }
    const res = await db
      .update(categories)
      .set(patch)
      .where(eq(categories.id, id))
      .returning();
    return res[0] ? toDomain(res[0]) : null;
  }

  async remove(id: string): Promise<boolean> {
    const db = getDb();
    const res = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    return res.length > 0;
  }

  async hasProducts(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);
    return rows.length > 0;
  }
}

function toDomain(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    lead: row.lead,
    icon: row.icon,
    sortOrder: row.sortOrder,
    active: row.active,
  };
}
