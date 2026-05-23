import { AdminOrdersList } from "@/components/admin-orders-list";
import { demoOrders } from "@/lib/data/demo-orders";

export default function AdminPedidos() {
  return (
    <div className="space-y-5">
      <div className="border-b border-[var(--color-line)] pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-700">
          Gestión
        </span>
        <h1 className="mt-1 font-display text-[26px] text-[var(--color-ink)]">Pedidos</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Toca un pedido para ver el detalle, confirmar por WhatsApp o cambiar de estado.
        </p>
      </div>
      <AdminOrdersList orders={demoOrders} />
    </div>
  );
}
