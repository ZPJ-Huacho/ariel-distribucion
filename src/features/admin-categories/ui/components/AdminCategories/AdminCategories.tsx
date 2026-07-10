"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Package,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useProducts } from "@/features/admin-products/api/useProducts";
import {
  useCategories,
  useDeleteCategory,
} from "../../../api/useCategories";
import { CategoryFormDialog } from "../CategoryFormDialog";
import { Input } from "@/shared/components/atoms/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/atoms/table";
import { cn } from "@/shared/lib/utils";

type SortKey = "title" | "slug" | "count";
type SortDir = "asc" | "desc";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function AdminCategories() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const remove = useDeleteCategory();

  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const perCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    let result = categories.slice();
    if (q) {
      result = result.filter(
        (c) => normalize(c.title).includes(q) || normalize(c.slug).includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    result.sort((a, b) => {
      if (sortKey === "count") {
        return ((perCategory.get(a.slug) ?? 0) - (perCategory.get(b.slug) ?? 0)) * dir;
      }
      if (sortKey === "slug") return a.slug.localeCompare(b.slug, "es") * dir;
      return a.title.localeCompare(b.title, "es") * dir;
    });
    return result;
  }, [categories, query, sortKey, sortDir, perCategory]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleDelete(id: string, title: string, count: number) {
    if (count > 0) {
      toast.error(
        `“${title}” tiene ${count} ${count === 1 ? "producto" : "productos"}. Reasígnalos primero.`,
      );
      return;
    }
    if (!confirm(`¿Borrar “${title}”?`)) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Categoría borrada");
    } catch (err) {
      const kind = (err as { kind?: string } | undefined)?.kind;
      if (kind === "conflict") toast.error("No se puede: tiene productos");
      else toast.error("No pudimos borrar");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar categoría…"
              aria-label="Buscar categorías"
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
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90 sm:px-4 sm:text-sm"
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Nueva categoría</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "categoría" : "categorías"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="font-semibold text-foreground">
              {products.length}
            </span>{" "}
            {products.length === 1 ? "producto" : "productos"}
          </span>
        </div>
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
          {categories.length === 0 ? (
            <>
              <Sparkles className="h-8 w-8 opacity-40" aria-hidden />
              <p>Aún no hay categorías.</p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Crear la primera
              </button>
            </>
          ) : (
            <>
              <Search className="h-8 w-8 opacity-40" aria-hidden />
              <p>No hay resultados para “{query}”.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 px-3">Icono</TableHead>
                  <SortHead
                    active={sortKey === "title"}
                    dir={sortDir}
                    onClick={() => toggleSort("title")}
                  >
                    Nombre
                  </SortHead>
                  <SortHead
                    active={sortKey === "slug"}
                    dir={sortDir}
                    onClick={() => toggleSort("slug")}
                  >
                    Slug
                  </SortHead>
                  <SortHead
                    active={sortKey === "count"}
                    dir={sortDir}
                    onClick={() => toggleSort("count")}
                    align="right"
                  >
                    Productos
                  </SortHead>
                  <TableHead className="w-20 pr-4 text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const count = perCategory.get(c.slug) ?? 0;
                  const hasProducts = count > 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="pl-4">
                        <span
                          className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary"
                          aria-hidden
                        >
                          {c.title.slice(0, 1).toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{c.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          /{c.slug}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                            hasProducts
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Package className="h-3 w-3" aria-hidden />
                          {count}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.title, count)}
                            disabled={remove.isPending || hasProducts}
                            aria-label={`Borrar ${c.title}`}
                            className={cn(
                              "grid h-8 w-8 place-items-center rounded-full transition-colors disabled:opacity-50",
                              hasProducts
                                ? "text-muted-foreground/40 cursor-not-allowed"
                                : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                            )}
                            title={
                              hasProducts
                                ? "Reasigna los productos antes de borrar"
                                : "Borrar categoría"
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ul className="flex flex-col gap-2.5 md:hidden">
            {filtered.map((c) => {
              const count = perCategory.get(c.slug) ?? 0;
              const hasProducts = count > 0;
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm"
                >
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-base font-semibold text-primary"
                    aria-hidden
                  >
                    {c.title.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {c.title}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      /{c.slug}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        hasProducts
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Package className="h-3 w-3" aria-hidden />
                      {count} {count === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.title, count)}
                    disabled={remove.isPending || hasProducts}
                    aria-label={`Borrar ${c.title}`}
                    className={cn(
                      "shrink-0 grid h-8 w-8 place-items-center rounded-full transition-colors disabled:opacity-50",
                      hasProducts
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <CategoryFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function SortHead({
  children,
  active,
  dir,
  onClick,
  align = "left",
}: {
  children: React.ReactNode;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <TableHead className={align === "right" ? "text-right" : ""}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-primary",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {children}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="h-3 w-3" aria-hidden />
          ) : (
            <ArrowDown className="h-3 w-3" aria-hidden />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden />
        )}
      </button>
    </TableHead>
  );
}
