"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/shared/lib/cart-store";
import { formatPrice } from "@/shared/lib/format";

export function CartBar() {
  const items = useCart((c) => c.items);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.quantity * i.price, 0);
  if (count === 0) return null;

  return (
    <div
      role="presentation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:px-4 md:pb-4"
    >
      <Link
        href="/pedido"
        aria-label={`Ver pedido con ${count} ${count === 1 ? "producto" : "productos"} por ${formatPrice(total)}`}
        className="pointer-events-auto group flex w-full max-w-md items-center gap-2.5 rounded-full bg-primary py-2 pl-2 pr-3 text-primary-foreground shadow-lg shadow-primary/40 outline-none transition-all hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white/50 sm:w-auto sm:gap-3 sm:py-2.5 sm:pl-2.5 sm:pr-4"
      >
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 sm:h-10 sm:w-10">
          <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-primary shadow-sm ring-2 ring-primary"
          >
            {count > 99 ? "99+" : count}
          </span>
        </span>

        <div className="flex min-w-0 flex-1 flex-col items-start leading-tight sm:flex-none">
          <span className="text-[10px] font-medium uppercase tracking-wider text-primary-foreground/75">
            {count} {count === 1 ? "producto" : "productos"}
          </span>
          <span className="truncate text-sm font-bold tabular-nums sm:text-base">
            {formatPrice(total)}
          </span>
        </div>

        <span className="ml-auto flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5 text-xs font-semibold transition-transform group-hover:translate-x-0.5 sm:ml-2">
          <span className="hidden sm:inline">Ver pedido</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </Link>
    </div>
  );
}
