"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
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
        className="pointer-events-auto group flex w-full max-w-md items-center justify-between gap-3 rounded-full border border-primary/20 bg-primary px-5 py-3 text-primary-foreground shadow-xl shadow-primary/20 transition hover:bg-primary/95"
      >
        <span className="flex items-center gap-3">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-foreground px-1 text-[10px] font-semibold text-primary">
              {count}
            </span>
          </span>
          <span className="text-[13px] font-semibold">Ver pedido</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-semibold tabular-nums">
            {formatPrice(total)}
          </span>
          <ArrowRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
