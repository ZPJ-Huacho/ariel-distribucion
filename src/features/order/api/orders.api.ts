import { publicApi } from "@/shared/infrastructure/http";
import type { CreateOrderInput, Order } from "@/core/orders";

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await publicApi.post<Order>("/api/orders", input);
  return data;
}
