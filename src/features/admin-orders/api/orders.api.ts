import { privateApi } from "@/shared/infrastructure/http";
import type { Order, OrderStatus } from "@/core/orders";

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await privateApi.get<Order[]>("/api/orders");
  return data;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const { data } = await privateApi.patch<Order>(`/api/orders/${id}/status`, {
    status,
  });
  return data;
}
