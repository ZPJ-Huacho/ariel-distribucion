"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpNarrowWide, Search, Sparkles, X } from "lucide-react";
import type { Product } from "@/core/products";
import { Input } from "@/shared/components/atoms/input";
import { cn } from "@/shared/lib/utils";
import { Catalog } from "../Catalog";

type SortId = "featured" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: { id: SortId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "featured", label: "Destacados", icon: Sparkles },
  { id: "price-asc", label: "Precio menor", icon: ArrowUpNarrowWide },
  { id: "price-desc", label: "Precio mayor", icon: ArrowDownWideNarrow },
  { id: "name", label: "Nombre A-Z", icon: ArrowDownAZ },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function CatalogFilters({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [sort, setSort] = useState<SortId>("featured");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = useMemo(() => {
    let result = products.slice();
    const q = normalize(deferredQuery.trim());
    if (q) {
      result = result.filter((p) => {
        return (
          normalize(p.name).includes(q) ||
          normalize(p.description ?? "").includes(q)
        );
      });
    }
    if (onlyAvailable) {
      result = result.filter((p) => p.isAvailable);
    }
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      case "featured":
        result.sort((a, b) => {
          const ah = a.isHighlighted ? 1 : 0;
          const bh = b.isHighlighted ? 1 : 0;
          if (ah !== bh) return bh - ah;
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        });
        break;
    }
    return result;
  }, [products, deferredQuery, sort, onlyAvailable]);

  const hasActiveFilters = query.length > 0 || sort !== "featured" || onlyAvailable;
  const availableCount = products.filter((p) => p.isAvailable).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto…"
              aria-label="Buscar productos"
              className="h-10 pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        </div>

        <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
          {SORT_OPTIONS.map(({ id, label, icon: Icon }) => {
            const active = sort === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSort(id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </button>
            );
          })}

          <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />

          <label
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              onlyAvailable
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
            )}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-primary"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            Solo disponibles
            <span className="text-[10px] text-muted-foreground">
              ({availableCount})
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span aria-live="polite">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "resultado" : "resultados"}
          {query && ` para “${query}”`}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSort("featured");
              setOnlyAvailable(false);
            }}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            <X className="h-3 w-3" aria-hidden />
            Limpiar filtros
          </button>
        )}
      </div>

      <Catalog products={filtered} />
    </div>
  );
}
