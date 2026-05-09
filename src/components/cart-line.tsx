"use client";

import type { CartItem } from "@/lib/data/types";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient}`}
        aria-hidden
      >
        <span className="text-2xl">{item.emoji}</span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-stone-900">{item.name}</span>
        <span className="text-[11px] text-stone-500">{item.unit}</span>
        <span className="text-sm font-bold text-brand-700">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Quitar uno"
          onClick={() => setQuantity(item.productId, item.quantity - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 active:scale-95"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
        <button
          type="button"
          aria-label="Añadir uno"
          onClick={() => setQuantity(item.productId, item.quantity + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Quitar producto"
          onClick={() => remove(item.productId)}
          className="ml-1 text-stone-400 hover:text-rose-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
        </button>
      </div>
    </li>
  );
}
