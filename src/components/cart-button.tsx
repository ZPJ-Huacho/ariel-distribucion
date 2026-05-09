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
        className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-brand-600 px-4 py-3.5 text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-700 active:scale-[0.99]"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
            {count}
          </span>
          <span className="text-sm font-semibold">Ver mi pedido</span>
        </span>
        <span className="text-base font-bold">{formatPrice(total)}</span>
      </Link>
    </div>
  );
}
