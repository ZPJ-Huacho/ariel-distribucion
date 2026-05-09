"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";

export function AdminProductsList({ products: seed }: { products: Product[] }) {
  const [products, setProducts] = useState(seed);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState<string>("");

  function startEdit(p: Product) {
    setEditingId(p.id);
    setDraftPrice(p.price.toString());
  }

  function commitEdit(id: string) {
    const next = parseFloat(draftPrice);
    if (!Number.isNaN(next) && next > 0) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price: next } : p)));
    }
    setEditingId(null);
  }

  function toggleAvailable(id: string) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p)),
    );
  }

  return (
    <ul className="space-y-2">
      {products.map((p) => {
        const isEditing = editingId === p.id;
        return (
          <li
            key={p.id}
            className={`flex items-center gap-3 rounded-2xl border bg-white p-3 ${
              p.isAvailable ? "border-stone-200" : "border-stone-200 opacity-70"
            }`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient}`}
              aria-hidden
            >
              <span className="text-xl">{p.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-stone-900">{p.name}</div>
              <div className="text-[11px] text-stone-500">{p.unit}</div>
              <div className="mt-1 flex items-center gap-2">
                {isEditing ? (
                  <>
                    <span className="text-stone-500">€</span>
                    <input
                      type="number"
                      step="0.5"
                      value={draftPrice}
                      onChange={(e) => setDraftPrice(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(p.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="w-20 rounded-md border border-brand-500 px-2 py-0.5 text-sm font-bold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => commitEdit(p.id)}
                      className="rounded-md bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white"
                    >
                      Guardar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="text-sm font-bold text-stone-900 hover:text-brand-700"
                  >
                    {formatPrice(p.price)}
                    <span className="ml-1 text-[11px] font-medium text-stone-400">tap para editar</span>
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={p.isAvailable}
              onClick={() => toggleAvailable(p.id)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                p.isAvailable ? "bg-brand-600" : "bg-stone-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  p.isAvailable ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
