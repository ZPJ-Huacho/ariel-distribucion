import { ShoppingBag } from "lucide-react";
import { AdminPageHeader } from "@/features/admin-dashboard/ui/components/AdminPageHeader";
import { AdminOrders } from "../components/AdminOrders";

export function AdminOrdersView() {
  return (
    <>
      <AdminPageHeader
        icon={ShoppingBag}
        eyebrow="Gestión"
        title="Pedidos"
        description="Sigue el estado de los pedidos recibidos."
      />
      <AdminOrders />
    </>
  );
}
