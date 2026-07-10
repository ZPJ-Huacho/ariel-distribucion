import type { CategoryRepository } from "../domain/repositories";
import { CategoryRepositoryDrizzle } from "./CategoryRepositoryDrizzle";

let cached: CategoryRepository | null = null;

export function getCategoryRepository(): CategoryRepository {
  if (!cached) cached = new CategoryRepositoryDrizzle();
  return cached;
}
