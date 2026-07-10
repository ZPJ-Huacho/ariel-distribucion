"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Package,
  PackagePlus,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { Product } from "@/core/products";
import { useCategories } from "@/features/admin-categories/api/useCategories";
import {
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../../../api/useProducts";
import { ProductFormDialog } from "../ProductFormDialog";
import { formatPrice } from "@/shared/lib/format";
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

type Availability = "all" | "available" | "unavailable";
type SortKey = "name" | "price" | "category";
type SortDir = "asc" | "desc";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function AdminProducts() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const toggleAvailable = useUpdateProduct();
  const toggleHighlighted = useUpdateProduct();
  const remove = useDeleteProduct();

  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<Availability>("all");
  const [category, setCategory] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const counts = useMemo(() => {
    return {
      total: products.length,
      available: products.filter((p) => p.isAvailable).length,
      unavailable: products.filter((p) => !p.isAvailable).length,
    };
  }, [products]);

  const perCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let result = products.slice();
    if (availability === "available")
      result = result.filter((p) => p.isAvailable);
    if (availability === "unavailable")
      result = result.filter((p) => !p.isAvailable);
    if (category !== "all")
      result = result.filter((p) => p.category === category);
    const q = normalize(query.trim());
    if (q) {
      result = result.filter((p) => {
        return (
          normalize(p.name).includes(q) ||
          normalize(p.description ?? "").includes(q)
        );
      });
    }
    const dir = sortDir === "asc" ? 1 : -1;
    result.sort((a, b) => {
      if (sortKey === "price") return (a.price - b.price) * dir;
      if (sortKey === "category")
        return a.category.localeCompare(b.category, "es") * dir;
      return a.name.localeCompare(b.name, "es") * dir;
    });
    return result;
  }, [products, query, availability, category, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleToggleAvailable(p: Product) {
    try {
      await toggleAvailable.mutateAsync({
        id: p.id,
        patch: { isAvailable: !p.isAvailable },
      });
    } catch {
      toast.error("No pudimos actualizar");
    }
  }

  async function handleToggleHighlighted(p: Product) {
    try {
      await toggleHighlighted.mutateAsync({
        id: p.id,
        patch: { isHighlighted: !p.isHighlighted },
      });
    } catch {
      toast.error("No pudimos actualizar");
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`¿Borrar “${p.name}”?`)) return;
    try {
      await remove.mutateAsync(p.id);
      toast.success("Borrado");
    } catch {
      toast.error("No pudimos borrar");
    }
  }

  const busy =
    toggleAvailable.isPending || toggleHighlighted.isPending || remove.isPending;

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Cargando productos…
      </div>
    );
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
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90 sm:px-4 sm:text-sm"
          >
            <PackagePlus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Nuevo producto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
          <FilterChip
            active={availability === "all"}
            onClick={() => setAvailability("all")}
            count={counts.total}
          >
            Todos
          </FilterChip>
          <FilterChip
            active={availability === "available"}
            onClick={() => setAvailability("available")}
            count={counts.available}
            dotColor="bg-emerald-500"
          >
            Disponibles
          </FilterChip>
          <FilterChip
            active={availability === "unavailable"}
            onClick={() => setAvailability("unavailable")}
            count={counts.unavailable}
            dotColor="bg-rose-500"
          >
            Agotados
          </FilterChip>
        </div>

        {categories.length > 0 && (
          <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
            <FilterChip
              active={category === "all"}
              onClick={() => setCategory("all")}
              count={counts.total}
            >
              Todas las categorías
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
                count={perCategory.get(c.slug) ?? 0}
              >
                {c.title}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span aria-live="polite">
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          {filtered.length === 1 ? "producto" : "productos"}
        </span>
        {(query || availability !== "all" || category !== "all") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setAvailability("all");
              setCategory("all");
            }}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            <X className="h-3 w-3" aria-hidden />
            Limpiar
          </button>
        )}
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
          <Package className="h-8 w-8 opacity-40" aria-hidden />
          <p>
            {products.length === 0
              ? "No hay productos todavía."
              : "No hay resultados con estos filtros."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 px-3">Imagen</TableHead>
                  <SortHead
                    active={sortKey === "name"}
                    dir={sortDir}
                    onClick={() => toggleSort("name")}
                  >
                    Producto
                  </SortHead>
                  <SortHead
                    active={sortKey === "category"}
                    dir={sortDir}
                    onClick={() => toggleSort("category")}
                  >
                    Categoría
                  </SortHead>
                  <SortHead
                    active={sortKey === "price"}
                    dir={sortDir}
                    onClick={() => toggleSort("price")}
                    align="right"
                  >
                    Precio
                  </SortHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-20 text-center">Destacado</TableHead>
                  <TableHead className="w-20 pr-4 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const cat = categories.find((c) => c.slug === p.category);
                  return (
                    <TableRow key={p.id} className="group">
                      <TableCell className="pl-4">
                        <ProductThumb product={p} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 whitespace-normal">
                          <p className="font-medium leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cat ? (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                            {cat.title}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {p.category}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold tabular-nums text-primary">
                          {formatPrice(p.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggleAvailable(p)}
                          disabled={busy}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 transition-colors disabled:opacity-50",
                            p.isAvailable
                              ? "bg-emerald-100 text-emerald-800 ring-emerald-200 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-800 ring-rose-200 hover:bg-rose-200",
                          )}
                          title="Cambiar disponibilidad"
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              p.isAvailable ? "bg-emerald-500" : "bg-rose-500",
                            )}
                          />
                          {p.isAvailable ? "Disponible" : "Agotado"}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleHighlighted(p)}
                          disabled={busy}
                          aria-pressed={p.isHighlighted}
                          aria-label={
                            p.isHighlighted
                              ? "Quitar de destacados"
                              : "Marcar como destacado"
                          }
                          className={cn(
                            "grid h-8 w-8 place-items-center rounded-full transition-colors disabled:opacity-50",
                            p.isHighlighted
                              ? "text-amber-500 hover:bg-amber-100"
                              : "text-muted-foreground/40 hover:bg-muted hover:text-amber-500",
                          )}
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              p.isHighlighted && "fill-amber-500",
                            )}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(p)}
                            disabled={busy}
                            aria-label={`Editar ${p.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            disabled={busy}
                            aria-label={`Borrar ${p.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
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
            {filtered.map((p) => (
              <ProductMobileCard
                key={p.id}
                product={p}
                category={categories.find((c) => c.slug === p.category)}
                busy={busy}
                onToggleAvailable={() => handleToggleAvailable(p)}
                onToggleHighlighted={() => handleToggleHighlighted(p)}
                onEdit={() => setEditing(p)}
                onDelete={() => handleDelete(p)}
              />
            ))}
          </ul>
        </>
      )}

      <ProductFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ProductFormDialog
        product={editing ?? undefined}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
      />
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

function ProductThumb({ product }: { product: Product }) {
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="44px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xl">
          {product.emoji}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  count,
  dotColor,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  dotColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
      )}
    >
      {dotColor && (
        <span
          aria-hidden
          className={cn("h-1.5 w-1.5 rounded-full", dotColor)}
        />
      )}
      <span className="truncate">{children}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
          active ? "bg-white/20" : "bg-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ProductMobileCard({
  product,
  category,
  busy,
  onToggleAvailable,
  onToggleHighlighted,
  onEdit,
  onDelete,
}: {
  product: Product;
  category?: { title: string };
  busy: boolean;
  onToggleAvailable: () => void;
  onToggleHighlighted: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-opacity",
        !product.isAvailable && "opacity-90",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          product.isAvailable ? "bg-emerald-500" : "bg-rose-500",
        )}
      />
      <div className="flex gap-3 p-3 pl-4">
        <ProductThumb product={product} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {product.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {product.unit}
              </p>
            </div>
            <p className="shrink-0 text-sm font-bold tabular-nums text-primary">
              {formatPrice(product.price)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {category && (
              <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-[10px]">
                {category.title}
              </span>
            )}
            {product.isHighlighted && (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" aria-hidden />
                Destacado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-2">
        <button
          type="button"
          onClick={onToggleAvailable}
          disabled={busy}
          role="switch"
          aria-checked={product.isAvailable}
          className="inline-flex items-center gap-2 disabled:opacity-50"
        >
          <span
            className={cn(
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
              product.isAvailable ? "bg-emerald-500" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                product.isAvailable ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              product.isAvailable ? "text-emerald-700" : "text-muted-foreground",
            )}
          >
            {product.isAvailable ? "Disponible" : "Agotado"}
          </span>
        </button>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleHighlighted}
            disabled={busy}
            aria-pressed={product.isHighlighted}
            aria-label={
              product.isHighlighted
                ? "Quitar de destacados"
                : "Marcar como destacado"
            }
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full transition-colors disabled:opacity-50",
              product.isHighlighted
                ? "text-amber-500 hover:bg-amber-100"
                : "text-muted-foreground/50 hover:bg-muted hover:text-amber-500",
            )}
          >
            <Star
              className={cn(
                "h-4 w-4",
                product.isHighlighted && "fill-amber-500",
              )}
            />
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            aria-label={`Editar ${product.name}`}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            aria-label={`Borrar ${product.name}`}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
