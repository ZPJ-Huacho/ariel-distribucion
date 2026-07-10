import type { ProductRepository } from "../domain/repositories";
import { ProductRepositoryDrizzle } from "./ProductRepositoryDrizzle";

let cached: ProductRepository | null = null;

export function getProductRepository(): ProductRepository {
  if (!cached) cached = new ProductRepositoryDrizzle();
  return cached;
}
