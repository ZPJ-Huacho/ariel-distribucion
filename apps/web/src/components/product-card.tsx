"use client";

import { useCart } from "@/lib/cart-store";
import { useToast } from "@/lib/toast-store";
import type { Product } from "@mercabana/core";
import { formatPrice, pricePerKg } from "@/lib/format";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const showToast = useToast((s) => s.show);
  const inCart = items.find((i) => i.productId === product.id);
  const [pulse, setPulse] = useState(false);
  const perKg = pricePerKg(product.unit, product.price);

  function handleAdd() {
    if (!product.isAvailable) return;
    add(product);
    showToast(`Añadido: ${product.name}`);
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  }

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] transition ${
        product.isAvailable ? "hover:border-brand-700/60" : "opacity-60"
      }`}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[var(--color-canvas-soft)]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl opacity-90" aria-hidden>
            {product.emoji}
          </span>
        )}
        {product.isHighlighted && product.isAvailable && (
          <span className="absolute left-2 top-2 rounded-sm border border-accent-500/70 bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-accent-700 shadow-sm">
            Selección
          </span>
        )}
        {!product.isAvailable && (
          <span className="absolute inset-0 flex items-center justify-center bg-[var(--color-ink)]/60 text-[11px] font-semibold uppercase tracking-wider text-white">
            Agotado hoy
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-[var(--color-line)] p-3">
        <h3 className="font-display text-[15px] leading-tight text-[var(--color-ink)]">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-[11px] text-[var(--color-ink-mute)]">
            {product.description}
          </p>
        )}
        <div className="mt-2 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="font-display text-xl font-semibold tabular-nums text-[var(--color-ink)]">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-[var(--color-ink-mute)]">
              {product.unit}
              {perKg && (
                <span className="ml-1 normal-case tracking-normal text-[var(--color-ink-soft)]">
                  · {perKg}
                </span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.isAvailable}
            aria-label={`Añadir ${product.name}`}
            className={`flex h-9 w-9 items-center justify-center rounded-md border border-brand-800 bg-brand-800 text-accent-100 transition active:scale-95 disabled:cursor-not-allowed disabled:border-[var(--color-line)] disabled:bg-[var(--color-canvas-soft)] disabled:text-[var(--color-ink-mute)] ${
              pulse ? "scale-105" : ""
            } hover:bg-brand-900`}
          >
            {inCart ? (
              <span className="text-sm font-semibold tabular-nums">{inCart.quantity}</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
