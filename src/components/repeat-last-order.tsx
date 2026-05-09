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
      className="group flex w-full items-center gap-3 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-3.5 text-left shadow-sm transition hover:border-brand-300 hover:shadow active:scale-[0.99]"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm"
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-3.4-7" />
          <polyline points="21 4 21 11 14 11" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-stone-900">¿Repetir tu último pedido, {firstName}?</span>
          <span className="shrink-0 text-sm font-bold text-brand-700">{formatPrice(last.total)}</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-stone-500">
          {last.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
        </p>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand-600 transition group-hover:translate-x-0.5" aria-hidden>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
