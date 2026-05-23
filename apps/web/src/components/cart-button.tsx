"use client";

import Link from "next/link";
import { cartItemCount, cartTotal, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartButton() {
  const items = useCart((s) => s.items);
  const count = cartItemCount(items);
  const total = cartTotal(items);

  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <Link
        href="/pedido"
        className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-md border border-brand-900 bg-brand-800 px-4 py-3 text-accent-100 shadow-[0_10px_30px_-12px_rgba(15,38,12,0.45)] transition hover:bg-brand-900"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-accent-500/40 bg-brand-900 text-[12px] font-semibold tabular-nums">
            {count}
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">Revisar pedido</span>
        </span>
        <span className="font-display text-base font-semibold tabular-nums text-white">
          {formatPrice(total)}
        </span>
      </Link>
    </div>
  );
}
