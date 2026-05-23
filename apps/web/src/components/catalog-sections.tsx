"use client";

import { ProductCard } from "@/components/product-card";
import type { CategoryDef, Product } from "@mercabana/core";

function productsByCategory(products: Product[]): Record<string, Product[]> {
  const grouped: Record<string, Product[]> = {};
  for (const p of [...products].sort((a, b) => a.sortOrder - b.sortOrder)) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }
  return grouped;
}

export function CatalogSections({
  seed,
  seedCategories,
  activeCategory,
}: {
  seed: Product[];
  seedCategories: CategoryDef[];
  activeCategory: string;
}) {
  const grouped = productsByCategory(seed);
  const sortedCategories = [...seedCategories].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  if (activeCategory !== "todas") {
    const list = grouped[activeCategory] ?? [];
    if (list.length === 0) {
      return (
        <section className="mt-6">
          <EmptyState />
        </section>
      );
    }
    return (
      <section className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="mt-6 space-y-10">
      {sortedCategories.map((def) => {
        const list = grouped[def.slug] ?? [];
        if (list.length === 0) return null;
        return (
          <section key={def.slug}>
            <SectionHeader def={def} count={list.length} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SectionHeader({ def, count }: { def: CategoryDef; count: number }) {
  return (
    <header className="mb-4 flex items-end justify-between gap-3 border-b border-[var(--color-line)] pb-2">
      <div className="flex items-start gap-3">
        <span
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[var(--color-line)] bg-[var(--color-canvas-soft)] text-xl sm:flex"
          aria-hidden
        >
          {def.icon}
        </span>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-700">
            {def.slug}
          </span>
          <h2 className="mt-1 font-display text-[20px] leading-tight text-[var(--color-ink)] sm:text-[22px]">
            {def.title}
          </h2>
          <p className="text-[12px] text-[var(--color-ink-soft)]">{def.lead}</p>
        </div>
      </div>
      <span className="shrink-0 rounded-sm border border-[var(--color-line)] bg-[var(--color-canvas-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        {count} producto{count === 1 ? "" : "s"}
      </span>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center text-sm text-[var(--color-ink-mute)]">
      No hay producto en esta categoría hoy.
    </div>
  );
}
