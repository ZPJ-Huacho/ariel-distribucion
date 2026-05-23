"use client";

import { useMemo, useState } from "react";
import type { CategoryDef, Product } from "@mercabana/core";
import { CategoryEditor } from "@/components/category-editor";
import { CategoryDeleteDialog } from "@/components/category-delete-dialog";

type EditorMode =
  | { type: "new" }
  | { type: "edit"; category: CategoryDef }
  | null;

export function AdminCategoriesList({
  initialCategories,
  initialProducts,
}: {
  initialCategories: CategoryDef[];
  initialProducts: Product[];
}) {
  const categories = initialCategories;
  const products = initialProducts;

  const [editor, setEditor] = useState<EditorMode>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDef | null>(null);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [products]);

  return (
    <>
      <div className="flex items-center justify-between rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
            Catálogo
          </span>
          <p className="font-display text-[15px] text-[var(--color-ink)]">
            {sorted.length} categoría{sorted.length === 1 ? "" : "s"} activa
            {sorted.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ type: "new" })}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-900 bg-brand-800 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-100 hover:bg-brand-900"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva categoría
        </button>
      </div>

      <ul className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
        {sorted.map((cat) => {
          const count = counts[cat.slug] ?? 0;
          return (
            <li
              key={cat.slug}
              className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3 last:border-b-0"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[var(--color-line)] bg-[var(--color-canvas-soft)] text-xl"
                aria-hidden
              >
                {cat.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[15px] text-[var(--color-ink)]">
                  {cat.title}
                </div>
                <div className="truncate text-[11px] text-[var(--color-ink-mute)]">
                  {cat.lead || "Sin subtítulo"} ·{" "}
                  <span className="font-mono tracking-tight">{cat.slug}</span>
                </div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
                  {count} producto{count === 1 ? "" : "s"}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditor({ type: "edit", category: cat })}
                  className="rounded-md border border-[var(--color-line)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft)]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  disabled={count > 0}
                  title={count > 0 ? "Borra primero los productos de la categoría" : undefined}
                  className="rounded-md border border-[var(--color-line)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
        {sorted.length === 0 && (
          <li className="p-8 text-center text-sm text-[var(--color-ink-mute)]">
            Aún no hay categorías. Crea una para empezar.
          </li>
        )}
      </ul>

      <CategoryEditor
        mode={editor}
        categories={categories}
        onClose={() => setEditor(null)}
      />
      <CategoryDeleteDialog
        category={deleteTarget}
        categories={categories}
        products={products}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
