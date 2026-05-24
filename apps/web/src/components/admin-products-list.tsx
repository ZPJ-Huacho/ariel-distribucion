"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { ApiError } from "@mercabana/core";
import type { CategoryDef, Product } from "@mercabana/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, pricePerKg } from "@/lib/format";
import { createBrowserApiClient } from "@/lib/api";
import { useToast } from "@/lib/toast-store";
import { ProductEditor } from "@/components/product-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";

type EditorMode = { type: "new" } | { type: "edit"; product: Product } | null;
type SortKey = "name" | "category" | "price" | "perKg" | "status";
type SortDir = "asc" | "desc";

export function AdminProductsList({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: CategoryDef[];
}) {
  const router = useRouter();
  const products = initialProducts;
  const categories = initialCategories;
  const showToast = useToast((s) => s.show);

  const [editor, setEditor] = useState<EditorMode>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("todas");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "unavailable">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const categoryMap = useMemo(() => {
    const m = new Map<string, { title: string; icon: string }>();
    for (const c of categories) m.set(c.slug, { title: c.title, icon: c.icon });
    return m;
  }, [categories]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (filterCat !== "todas" && p.category !== filterCat) return false;
      if (filterStatus === "available" && !p.isAvailable) return false;
      if (filterStatus === "unavailable" && p.isAvailable) return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [products, search, filterCat, filterStatus]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name, "es") * dir;
        case "category": {
          const ta = categoryMap.get(a.category)?.title ?? a.category;
          const tb = categoryMap.get(b.category)?.title ?? b.category;
          return ta.localeCompare(tb, "es") * dir;
        }
        case "price":
          return (a.price - b.price) * dir;
        case "perKg":
          return (perKgValue(a) - perKgValue(b)) * dir;
        case "status":
          return ((a.isAvailable ? 1 : 0) - (b.isAvailable ? 1 : 0)) * dir;
      }
    });
    return out;
  }, [filtered, sortKey, sortDir, categoryMap]);

  function setSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await createBrowserApiClient().admin.products.remove(target.id);
      showToast(`Eliminado: ${target.name}`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? `Error ${err.status}` : "Sin conexión";
      showToast(`No se pudo eliminar (${msg})`);
    }
  }

  async function toggleAvailable(p: Product) {
    try {
      await createBrowserApiClient().admin.products.update(p.id, {
        isAvailable: !p.isAvailable,
      });
      router.refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? `Error ${err.status}` : "Sin conexión";
      showToast(`No se pudo actualizar (${msg})`);
    }
  }

  const totalAvailable = products.filter((p) => p.isAvailable).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Catálogo
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-foreground">
            Productos
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {products.length} producto{products.length === 1 ? "" : "s"} ·{" "}
            <span>
              {totalAvailable} disponible{totalAvailable === 1 ? "" : "s"}
            </span>
          </p>
        </div>
        <Button onClick={() => setEditor({ type: "new" })} className="self-start">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      <Card className="p-0">
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto…"
              className="pl-9"
            />
          </div>
          <Select value={filterCat} onValueChange={(v) => setFilterCat(v ?? "todas")}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {sortedCategories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.icon} {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus((v ?? "all") as typeof filterStatus)}
          >
            <SelectTrigger className="sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier estado</SelectItem>
              <SelectItem value="available">Disponibles</SelectItem>
              <SelectItem value="unavailable">Agotados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-muted-foreground">
              No hay productos que coincidan con los filtros.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16"></TableHead>
                      <SortHeader k="name" sortKey={sortKey} sortDir={sortDir} onSort={setSort}>
                        Producto
                      </SortHeader>
                      <SortHeader k="category" sortKey={sortKey} sortDir={sortDir} onSort={setSort}>
                        Categoría
                      </SortHeader>
                      <TableHead>Unidad</TableHead>
                      <SortHeader
                        k="price"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={setSort}
                        className="text-right"
                      >
                        Precio
                      </SortHeader>
                      <SortHeader
                        k="perKg"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={setSort}
                        className="text-right"
                      >
                        €/kg
                      </SortHeader>
                      <SortHeader
                        k="status"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={setSort}
                        className="text-center"
                      >
                        Estado
                      </SortHeader>
                      <TableHead className="w-32 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((p) => {
                      const cat = categoryMap.get(p.category);
                      const perKg = pricePerKg(p.unit, p.price);
                      return (
                        <TableRow
                          key={p.id}
                          className={cn(p.isAvailable ? "" : "opacity-60")}
                        >
                          <TableCell>
                            <Thumb product={p} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-foreground">
                                {p.name}
                              </span>
                              {p.isHighlighted && (
                                <Badge
                                  variant="secondary"
                                  className="rounded-full text-[10px]"
                                >
                                  Top
                                </Badge>
                              )}
                            </div>
                            {p.description && (
                              <div className="line-clamp-1 max-w-[280px] text-[11.5px] text-muted-foreground">
                                {p.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {cat ? (
                              <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                <span aria-hidden>{cat.icon}</span>
                                {cat.title}
                              </span>
                            ) : (
                              <span className="text-[12px] italic text-destructive">
                                sin categoría
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-[12px] text-muted-foreground">
                            {p.unit}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {formatPrice(p.price)}
                          </TableCell>
                          <TableCell className="text-right text-[12px] tabular-nums text-muted-foreground">
                            {perKg ?? "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <AvailableToggle
                              available={p.isAvailable}
                              onToggle={() => toggleAvailable(p)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditor({ type: "edit", product: p })}
                                aria-label="Editar"
                                className="h-8 w-8"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(p)}
                                aria-label="Eliminar"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <ul className="divide-y divide-border md:hidden">
                {sorted.map((p) => {
                  const cat = categoryMap.get(p.category);
                  return (
                    <li
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 p-3",
                        p.isAvailable ? "" : "opacity-60",
                      )}
                    >
                      <Thumb product={p} large />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13.5px] font-semibold text-foreground">
                            {p.name}
                          </span>
                          {p.isHighlighted && (
                            <Badge variant="secondary" className="rounded-full text-[10px]">
                              Top
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground">
                          {cat ? `${cat.icon} ${cat.title}` : "sin categoría"} · {p.unit}
                        </div>
                        <div className="mt-1 text-[14px] font-semibold tabular-nums text-foreground">
                          {formatPrice(p.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AvailableToggle
                          available={p.isAvailable}
                          onToggle={() => toggleAvailable(p)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Acciones"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => setEditor({ type: "edit", product: p })}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(p)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <ProductEditor
        mode={editor}
        categories={categories}
        onClose={() => setEditor(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        tone="danger"
        title={deleteTarget ? `Eliminar "${deleteTarget.name}"` : ""}
        description={
          deleteTarget
            ? "Vas a quitar este producto del catálogo. Esta acción no se puede deshacer."
            : undefined
        }
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function perKgValue(p: Product): number {
  const m = p.unit.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (!m) return Number.POSITIVE_INFINITY;
  const kg = parseFloat(m[1].replace(",", "."));
  return kg > 0 ? p.price / kg : Number.POSITIVE_INFINITY;
}

function SortHeader({
  k,
  sortKey,
  sortDir,
  onSort,
  className,
  children,
}: {
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const active = sortKey === k;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {children}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    </TableHead>
  );
}

function Thumb({ product, large = false }: { product: Product; large?: boolean }) {
  const size = large ? "h-12 w-12" : "h-10 w-10";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted",
        size,
      )}
      aria-hidden
    >
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className={large ? "text-2xl" : "text-xl"}>{product.emoji}</span>
      )}
    </div>
  );
}

function AvailableToggle({
  available,
  onToggle,
}: {
  available: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={available}
      aria-label="Disponible hoy"
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
        available ? "bg-primary" : "bg-input",
      )}
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full bg-background shadow-sm transition",
          available ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}
