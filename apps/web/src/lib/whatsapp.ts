import type { CartItem, Tenant } from "./data/types";
import { formatPrice } from "./format";

export type OrderDraft = {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  preferredTime?: string;
  notes?: string;
  source: string;
};

export function buildOrderMessage(
  items: CartItem[],
  draft: OrderDraft,
  tenant: Tenant,
): string {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const lines: string[] = [];
  lines.push(`Hola ${tenant.name}! 👋`);
  lines.push(`Quería hacer este pedido:`);
  lines.push("");
  for (const item of items) {
    lines.push(
      `• ${item.quantity}× ${item.name} (${item.unit}) — ${formatPrice(item.price * item.quantity)}`,
    );
  }
  lines.push("");
  lines.push(`*Total: ${formatPrice(total)}*`);
  lines.push("");
  lines.push(`👤 ${draft.customerName}`);
  lines.push(`📞 ${draft.customerPhone}`);
  if (draft.customerAddress) lines.push(`📍 ${draft.customerAddress}`);
  if (draft.preferredTime) lines.push(`🕒 Entrega: ${draft.preferredTime}`);
  if (draft.notes) lines.push(`📝 ${draft.notes}`);
  lines.push("");
  lines.push(`(pedido desde ${draft.source})`);
  return lines.join("\n");
}

export function buildWhatsAppLink(message: string, phone: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
