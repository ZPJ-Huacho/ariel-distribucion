import { AdminOrdersList } from "@/components/admin-orders-list";
import { demoOrders } from "@/lib/data/demo-orders";

export default function AdminPedidos() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Pedidos</h1>
        <p className="text-sm text-stone-500">Toca un pedido para ver el detalle y cambiar estado.</p>
      </div>
      <AdminOrdersList orders={demoOrders} />
    </div>
  );
}
