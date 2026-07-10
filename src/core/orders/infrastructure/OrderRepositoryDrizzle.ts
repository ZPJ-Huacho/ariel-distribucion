import { desc, eq } from "drizzle-orm";
import { getDb, orders } from "@/shared/lib/db";
import type { OrderRepository } from "../domain/repositories";
import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderStatus,
} from "../domain/models";

function orderCode(): string {
  return `PED-${Math.floor(2500 + Math.random() * 8000)}`;
}

export class OrderRepositoryDrizzle implements OrderRepository {
  async list(): Promise<Order[]> {
    const db = getDb();
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return rows.map(toDomain);
  }

  async listByUser(userId: string): Promise<Order[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    return rows.map(toDomain);
  }

  async create(input: CreateOrderInput, userId: string | null): Promise<Order> {
    const db = getDb();
    const total = input.items.reduce((n, i) => n + i.quantity * i.price, 0);
    const [row] = await db
      .insert(orders)
      .values({
        userId,
        code: orderCode(),
        status: "pending",
        source: input.source ?? "direct",
        total,
        items: input.items,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress ?? null,
        preferredTime: input.preferredTime ?? null,
        notes: input.notes ?? null,
      })
      .returning();
    return toDomain(row);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const db = getDb();
    const res = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return res[0] ? toDomain(res[0]) : null;
  }
}

function toDomain(row: typeof orders.$inferSelect): Order {
  return {
    id: row.id,
    userId: row.userId,
    code: row.code,
    status: row.status,
    source: row.source,
    total: row.total,
    items: row.items as OrderItem[],
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerAddress: row.customerAddress,
    preferredTime: row.preferredTime,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
