import type { Order } from "@/core/orders";
import { formatPrice } from "@/shared/lib/format";

export function buildConfirmationLink(order: Order): string {
  const phone = order.customerPhone.replace(/[^0-9]/g, "");
  const lines = [
    `Hola ${order.customerName}! 👋`,
    `Confirmamos tu pedido ${order.code}:`,
    "",
    ...order.items.map(
      (i) => `• ${i.quantity}× ${i.name} — ${formatPrice(i.price * i.quantity)}`,
    ),
    "",
    `*Total: ${formatPrice(order.total)}*`,
  ];
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
