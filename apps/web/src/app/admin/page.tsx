import { redirect } from "next/navigation";
import { ApiError } from "@mercabana/core";
import type { AdminOrder, Product } from "@mercabana/core";
import { AdminDashboard } from "@/components/admin-dashboard";
import { createRequestApiClient } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const client = await createRequestApiClient();
  let orders: AdminOrder[] = [];
  let products: Product[] = [];
  try {
    [orders, products] = await Promise.all([
      client.admin.orders.list(),
      client.products.list(),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login?redirect=/admin");
    }
    console.warn("[admin] failed to load:", err);
  }
  return <AdminDashboard orders={orders} products={products} />;
}
