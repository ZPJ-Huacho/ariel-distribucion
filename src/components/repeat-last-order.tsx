"use client";

import { useOrders } from "@/lib/orders-store";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/lib/toast-store";
import { products } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";

export function RepeatLastOrder() {
  const orders = useOrders((s) => s.orders);
  const customer = useOrders((s) => s.customer);
  const hydrated = useOrders((s) => s.hydrated);
  const items = useCart((s) => s.items);
  const cartItems = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const showToast = useToast((s) => s.show);

  if (!hydrated || orders.length === 0 || items.length > 0) return null;

  const last = orders[0];
  const firstName = (customer?.customerName ?? last.customerName).split(" ")[0];

  function repeat() {
    const productMap = new Map(products.map((p) => [p.name, p]));
    let added = 0;
    for (const item of last.items) {
      const product = productMap.get(item.name);
      if (!product || !product.isAvailable) continue;
      const inCart = cartItems.find((c) => c.productId === product.id);
      const targetQty = (inCart?.quantity ?? 0) + item.quantity;
      setQuantity(product.id, targetQty);
      added += item.quantity;
    }
    if (added === 0) {
      showToast("Algunos productos ya no están disponibles");
    } else {
      showToast(`Añadidos ${added} productos del último pedido`);
    }
  }

  return (
    <button
      type="button"
      onClick={repeat}
      className="group flex w-full items-center gap-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 text-left transition hover:border-brand-700 active:scale-[0.997]"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-brand-700 bg-brand-800 text-accent-100"
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-3.4-7" />
          <polyline points="21 4 21 11 14 11" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-700">
            Pedido recurrente
          </span>
          <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-[var(--color-ink)]">
            {formatPrice(last.total)}
          </span>
        </div>
        <div className="mt-0.5 font-display text-[15px] text-[var(--color-ink)]">
          Repetir último pedido de {firstName}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-[var(--color-ink-mute)]">
          {last.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
        </p>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-[var(--color-ink-mute)] transition group-hover:translate-x-0.5 group-hover:text-brand-700"
        aria-hidden
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
