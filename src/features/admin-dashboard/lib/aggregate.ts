import type { Order, OrderItem } from "@/shared/lib/db";

export type DayPoint = {
  date: string;
  orders: number;
  revenue: number;
};

export type StatusKey =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled";

export type StatusStat = { status: StatusKey; count: number };

export type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
};

const STATUS_KEYS: StatusKey[] = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];

function ymd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildDailySeries(orders: Order[], days: number): DayPoint[] {
  const today = new Date();
  const map = new Map<string, DayPoint>();
  for (let i = 0; i < days; i++) {
    const d = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    const key = ymd(d);
    map.set(key, { date: key, orders: 0, revenue: 0 });
  }
  for (const o of orders) {
    const key = ymd(o.createdAt);
    const point = map.get(key);
    if (!point) continue;
    point.orders += 1;
    point.revenue += o.total;
  }
  return Array.from(map.values());
}

export function buildStatusStats(orders: Order[]): StatusStat[] {
  const counts: Record<StatusKey, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    if (o.status in counts) counts[o.status as StatusKey] += 1;
  }
  return STATUS_KEYS.map((status) => ({ status, count: counts[status] }));
}

export function buildTopProducts(orders: Order[], limit = 5): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const o of orders) {
    for (const item of o.items as OrderItem[]) {
      const existing = map.get(item.name) ?? {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.quantity * item.price;
      map.set(item.name, existing);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function sumRevenue(points: DayPoint[]): number {
  return points.reduce((n, p) => n + p.revenue, 0);
}

export function sumOrders(points: DayPoint[]): number {
  return points.reduce((n, p) => n + p.orders, 0);
}
