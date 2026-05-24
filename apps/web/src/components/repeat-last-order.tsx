"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
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
      className="group mb-4 flex w-full items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-accent/50 to-card p-4 text-left transition hover:border-primary/30 hover:shadow-sm active:scale-[0.997]"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
        aria-hidden
      >
        <RotateCcw className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">
            Pedido recurrente
          </span>
          <span className="shrink-0 text-[14px] font-semibold tabular-nums text-foreground">
            {formatPrice(last.total)}
          </span>
        </div>
        <div className="mt-0.5 text-[14.5px] font-semibold text-foreground">
          Repetir último pedido de {firstName}
        </div>
        <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
          {last.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  );
}
