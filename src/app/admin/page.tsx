import { AdminDashboardView } from "@/features/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  return <AdminDashboardView />;
}
