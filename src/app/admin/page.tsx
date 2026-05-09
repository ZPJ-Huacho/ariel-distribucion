import { AdminDashboard } from "@/components/admin-dashboard";
import { demoOrders } from "@/lib/data/demo-orders";

export default function AdminDashboardPage() {
  return <AdminDashboard demoOrders={demoOrders} />;
}
