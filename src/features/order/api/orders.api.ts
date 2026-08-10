import { publicApi } from "@/shared/infrastructure/http";
import type { CreateOrderInput, Order } from "@/core/orders";

export async function createOrder(
  input: CreateOrderInput & { _ts?: string | null; _hp?: string },
): Promise<Order> {
  const { data } = await publicApi.post<Order>("/api/orders", input);
  return data;
}
