"use client";

import type { CartItem } from "@mercabana/core";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  return (
    <li className="flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-canvas-soft)]"
        aria-hidden
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl opacity-90">{item.emoji}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-display text-[15px] text-[var(--color-ink)]">{item.name}</span>
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-ink-mute)]">
          {item.unit} · {formatPrice(item.price)}/ud
        </span>
        <span className="font-display text-[15px] font-semibold tabular-nums text-[var(--color-ink)]">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Quitar uno"
          onClick={() => setQuantity(item.productId, item.quantity - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-brand-700 hover:text-brand-700 active:scale-95"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
        <button
          type="button"
          aria-label="Añadir uno"
          onClick={() => setQuantity(item.productId, item.quantity + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-brand-700 hover:text-brand-700 active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Quitar producto"
          onClick={() => remove(item.productId)}
          className="ml-1 text-[var(--color-ink-mute)] hover:text-rose-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
        </button>
      </div>
    </li>
  );
}
