import type { OrderRepository } from "../domain/repositories";
import { OrderRepositoryDrizzle } from "./OrderRepositoryDrizzle";

let cached: OrderRepository | null = null;

export function getOrderRepository(): OrderRepository {
  if (!cached) cached = new OrderRepositoryDrizzle();
  return cached;
}
