"use client";

import { useCart } from "@/lib/cart-store";
import { useToast } from "@/lib/toast-store";
import type { Product } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const showToast = useToast((s) => s.show);
  const inCart = items.find((i) => i.productId === product.id);
  const [pulse, setPulse] = useState(false);

  function handleAdd() {
    if (!product.isAvailable) return;
    add(product);
    showToast(`Añadido: ${product.name}`);
    setPulse(true);
    setTimeout(() => setPulse(false), 350);
  }

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition ${
        product.isAvailable ? "hover:shadow-md" : "opacity-60"
      }`}
    >
      <div
        className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.gradient}`}
      >
        <span className="text-7xl drop-shadow-sm" aria-hidden>
          {product.emoji}
        </span>
        {product.isHighlighted && product.isAvailable && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-800 shadow-sm">
            ⭐ Top
          </span>
        )}
        {!product.isAvailable && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
            Agotado hoy
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold leading-tight text-stone-900">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-stone-500">{product.description}</p>
        <div className="mt-2 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-stone-900">{formatPrice(product.price)}</span>
            <span className="text-[11px] text-stone-500">{product.unit}</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.isAvailable}
            aria-label={`Añadir ${product.name}`}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 ${
              pulse ? "scale-110" : ""
            } bg-brand-600 hover:bg-brand-700`}
          >
            {inCart ? (
              <span className="text-sm font-bold">{inCart.quantity}</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
