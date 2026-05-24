"use client";

import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
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
        <section className="mt-8">
          <EmptyState />
        </section>
      );
    }
    return (
      <section className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="mt-8 space-y-12">
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
    <header className="mb-5 flex items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl"
          aria-hidden
        >
          {def.icon}
        </span>
        <div>
          <h2 className="text-[20px] font-semibold leading-tight tracking-tight text-foreground sm:text-[22px]">
            {def.title}
          </h2>
          {def.lead && (
            <p className="text-[12.5px] text-muted-foreground">{def.lead}</p>
          )}
        </div>
      </div>
      <Badge
        variant="secondary"
        className="shrink-0 rounded-full text-[10.5px] font-medium"
      >
        {count} producto{count === 1 ? "" : "s"}
      </Badge>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center text-sm text-muted-foreground">
      No hay producto en esta categoría hoy.
    </div>
  );
}
