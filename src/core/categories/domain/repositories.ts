import type { Category, CategoryInput } from "./models";

export interface CategoryRepository {
  listActive(): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | null>;
  create(input: CategoryInput): Promise<Category>;
  update(id: string, patch: Partial<CategoryInput>): Promise<Category | null>;
  remove(id: string): Promise<boolean>;
  hasProducts(id: string): Promise<boolean>;
}
