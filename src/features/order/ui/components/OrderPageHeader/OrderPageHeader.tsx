"use client";

import { MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/shared/lib/cart-store";

export function OrderPageHeader() {
  const count = useCart((c) => c.items.reduce((n, i) => n + i.quantity, 0));
  const hasItems = count > 0;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-primary/15 p-3.5 shadow-sm sm:p-6 md:p-7"
      style={{
        background: `radial-gradient(120% 100% at 0% 0%,
          color-mix(in oklch, var(--primary) 12%, var(--card)) 0%,
          var(--card) 70%)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 60%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 sm:h-11 sm:w-11 md:h-12 md:w-12"
        >
          <ShoppingCart className="h-[18px] w-[18px] sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl md:text-3xl">
              Tu pedido
            </h1>
            {hasItems && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:text-[11px]">
                {count} {count === 1 ? "producto" : "productos"}
              </span>
            )}
          </div>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground sm:items-center sm:text-sm">
            <MessageCircle
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70 sm:mt-0"
              aria-hidden
            />
            <span className="min-w-0">Revisa y confirma por WhatsApp.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
