import type { Product, ProductInput } from "./models";

export interface ProductRepository {
  list(categorySlug?: string): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(categoryId: string, input: ProductInput): Promise<Product>;
  update(
    id: string,
    patch: Partial<Omit<ProductInput, "category">> & { categoryId?: string },
  ): Promise<Product | null>;
  remove(id: string): Promise<{ removed: boolean; imageKey: string | null }>;
  setImageKey(id: string, key: string | null): Promise<string | null>;
}
