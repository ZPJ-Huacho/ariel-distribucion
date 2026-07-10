import type { CreateOrderInput, Order, OrderStatus } from "./models";

export interface OrderRepository {
  list(): Promise<Order[]>;
  listByUser(userId: string): Promise<Order[]>;
  create(input: CreateOrderInput, userId: string | null): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
}
