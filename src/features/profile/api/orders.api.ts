import { privateApi } from "@/shared/infrastructure/http";
import type { Order } from "@/core/orders";

export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await privateApi.get<Order[]>("/api/orders/mine");
  return data;
}
