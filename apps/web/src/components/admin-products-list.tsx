"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@mercabana/core";
import { formatPrice, pricePerKg } from "@/lib/format";
import { useProducts } from "@/lib/products-store";
import { useCategories } from "@/lib/categories-store";
import { useToast } from "@/lib/toast-store";
import { ProductEditor } from "@/components/product-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";

type EditorMode = { type: "new" } | { type: "edit"; product: Product } | null;
type SortKey = "name" | "category" | "price" | "perKg" | "status";
type SortDir = "asc" | "desc";

export function AdminProductsList() {
  const products = useProducts((s) => s.products);
  const hydrated = useProducts((s) => s.hydrated);
  const updateProduct = useProducts((s) => s.updateProduct);
  const removeProduct = useProducts((s) => s.removeProduct);
  const categories = useCategories((s) => s.categories);
  const showToast = useToast((s) => s.show);

  const [editor, setEditor] = useState<EditorMode>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("todas");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "unavailable">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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
        case "perKg": {
          const va = perKgValue(a);
          const vb = perKgValue(b);
          return (va - vb) * dir;
        }
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

  function openDelete(p: Product) {
    setMenuOpenId(null);
    setDeleteTarget(p);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    removeProduct(deleteTarget.id);
    showToast(`Eliminado: ${name}`);
  }

  function toggleAvailable(p: Product) {
    updateProduct(p.id, { isAvailable: !p.isAvailable });
  }

  if (!hydrated) {
    return (
      <div className="rounded-md border border-dashed border-[var(--color-line)] p-8 text-center text-sm text-[var(--color-ink-mute)]">
        Cargando catálogo…
      </div>
    );
  }

  const totalAvailable = products.filter((p) => p.isAvailable).length;

  return (
    <>
      <header className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
              Inventario
            </span>
            <p className="font-display text-[15px] text-[var(--color-ink)]">
              {products.length} producto{products.length === 1 ? "" : "s"} ·{" "}
              <span className="text-[var(--color-ink-soft)]">
                {totalAvailable} disponible{totalAvailable === 1 ? "" : "s"}
              </span>
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
            Nuevo producto
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 border-t border-[var(--color-line)] px-4 py-3 sm:grid-cols-[1fr_auto_auto]">
          <SearchInput value={search} onChange={setSearch} />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[12px] focus:border-brand-700 focus:outline-none"
          >
            <option value="todas">Todas las categorías</option>
            {sortedCategories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.icon} {c.title}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[12px] focus:border-brand-700 focus:outline-none"
          >
            <option value="all">Cualquier estado</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">Agotados</option>
          </select>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--color-line)] p-10 text-center text-sm text-[var(--color-ink-mute)]">
          No hay productos que coincidan con los filtros.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] md:block">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-canvas-soft)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-mute)]">
                <tr>
                  <th className="w-14 px-3 py-2.5"></th>
                  <SortHeader label="Producto" k="name" sortKey={sortKey} sortDir={sortDir} onSort={setSort} />
                  <SortHeader label="Categoría" k="category" sortKey={sortKey} sortDir={sortDir} onSort={setSort} />
                  <th className="px-3 py-2.5">Unidad</th>
                  <SortHeader label="Precio" k="price" sortKey={sortKey} sortDir={sortDir} onSort={setSort} align="right" />
                  <SortHeader label="€/kg" k="perKg" sortKey={sortKey} sortDir={sortDir} onSort={setSort} align="right" />
                  <SortHeader label="Estado" k="status" sortKey={sortKey} sortDir={sortDir} onSort={setSort} align="center" />
                  <th className="w-12 px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => {
                  const cat = categoryMap.get(p.category);
                  const perKg = pricePerKg(p.unit, p.price);
                  return (
                    <tr
                      key={p.id}
                      className={`border-t border-[var(--color-line)] transition hover:bg-[var(--color-canvas-soft)]/40 ${
                        p.isAvailable ? "" : "opacity-65"
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <Thumb product={p} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-[14px] text-[var(--color-ink)]">
                            {p.name}
                          </span>
                          {p.isHighlighted && (
                            <span className="rounded-sm border border-accent-500/70 bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-accent-700">
                              Destacado
                            </span>
                          )}
                        </div>
                        {p.description && (
                          <div className="line-clamp-1 max-w-[280px] text-[11px] text-[var(--color-ink-mute)]">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-ink-soft)]">
                            <span aria-hidden>{cat.icon}</span>
                            {cat.title}
                          </span>
                        ) : (
                          <span className="text-[12px] italic text-rose-700">
                            sin categoría
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-[var(--color-ink-soft)]">
                        {p.unit}
                      </td>
                      <td className="px-3 py-2.5 text-right font-display tabular-nums text-[var(--color-ink)]">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[12px] tabular-nums text-[var(--color-ink-soft)]">
                        {perKg ?? "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-center">
                          <AvailableToggle
                            available={p.isAvailable}
                            onToggle={() => toggleAvailable(p)}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <ActionMenu
                          open={menuOpenId === p.id}
                          onToggle={() =>
                            setMenuOpenId(menuOpenId === p.id ? null : p.id)
                          }
                          onClose={() => setMenuOpenId(null)}
                          onEdit={() => {
                            setMenuOpenId(null);
                            setEditor({ type: "edit", product: p });
                          }}
                          onDelete={() => openDelete(p)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {sorted.map((p) => {
              const cat = categoryMap.get(p.category);
              const perKg = pricePerKg(p.unit, p.price);
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-3 transition ${
                    p.isAvailable ? "" : "opacity-65"
                  }`}
                >
                  <Thumb product={p} large />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[14px] text-[var(--color-ink)]">
                        {p.name}
                      </span>
                      {p.isHighlighted && (
                        <span className="rounded-sm border border-accent-500/70 bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-accent-700">
                          Top
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--color-ink-mute)]">
                      {cat ? `${cat.icon} ${cat.title}` : "sin categoría"} · {p.unit}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="font-display text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                        {formatPrice(p.price)}
                      </span>
                      {perKg && (
                        <span className="text-[11px] tabular-nums text-[var(--color-ink-soft)]">
                          {perKg}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <AvailableToggle
                      available={p.isAvailable}
                      onToggle={() => toggleAvailable(p)}
                    />
                    <ActionMenu
                      open={menuOpenId === p.id}
                      onToggle={() =>
                        setMenuOpenId(menuOpenId === p.id ? null : p.id)
                      }
                      onClose={() => setMenuOpenId(null)}
                      onEdit={() => {
                        setMenuOpenId(null);
                        setEditor({ type: "edit", product: p });
                      }}
                      onDelete={() => openDelete(p)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ProductEditor mode={editor} onClose={() => setEditor(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        tone="danger"
        title={deleteTarget ? `Eliminar "${deleteTarget.name}"` : ""}
        description={
          deleteTarget && (
            <p>
              Vas a quitar este producto del catálogo. Esta acción no se puede
              deshacer.
            </p>
          )
        }
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

function perKgValue(p: Product): number {
  const m = p.unit.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (!m) return Number.POSITIVE_INFINITY;
  const kg = parseFloat(m[1].replace(",", "."));
  return kg > 0 ? p.price / kg : Number.POSITIVE_INFINITY;
}

function SortHeader({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right" | "center";
}) {
  const active = sortKey === k;
  const arrow = active ? (sortDir === "asc" ? "▲" : "▼") : "";
  const justify =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <th className="px-3 py-2.5">
      <button
        type="button"
        onClick={() => onSort(k)}
        className={`flex w-full items-center gap-1 ${justify} text-[10px] font-semibold uppercase tracking-[0.14em] ${
          active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-mute)]"
        }`}
      >
        {label}
        <span aria-hidden className="text-[8px]">
          {arrow}
        </span>
      </button>
    </th>
  );
}

function Thumb({ product, large = false }: { product: Product; large?: boolean }) {
  const size = large ? "h-14 w-14" : "h-10 w-10";
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-canvas-soft)]`}
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
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
        available ? "bg-brand-700" : "bg-[var(--color-line)]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
          available ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function ActionMenu({
  open,
  onToggle,
  onClose,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    function compute() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(t) &&
        menuRef.current &&
        !menuRef.current.contains(t)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-label="Más acciones"
        aria-haspopup
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-md border transition ${
          open
            ? "border-brand-700 bg-brand-50 text-brand-800"
            : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)]"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {mounted && open && pos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: pos.top, right: pos.right }}
            className="z-50 w-44 overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] shadow-xl"
          >
            <MenuItem onClick={onEdit} label="Editar" />
            <MenuItem onClick={onDelete} label="Eliminar" tone="danger" />
          </div>,
          document.body,
        )}
    </>
  );
}

function MenuItem({
  label,
  onClick,
  tone = "neutral",
}: {
  label: string;
  onClick: () => void;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-4 py-2 text-left text-[12px] font-medium uppercase tracking-wide transition ${
        tone === "danger"
          ? "text-rose-700 hover:bg-rose-50"
          : "text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft)]"
      }`}
    >
      {label}
    </button>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-mute)]"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar producto…"
        className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] py-2 pl-8 pr-3 text-[12px] focus:border-brand-700 focus:outline-none"
      />
    </div>
  );
}
