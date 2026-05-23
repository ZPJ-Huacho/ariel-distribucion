"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@mercabana/core";
import type { CategoryDef, Product } from "@mercabana/core";
import { createBrowserApiClient } from "@/lib/api";
import { useToast } from "@/lib/toast-store";

type Action = "move" | "delete-products";

export function CategoryDeleteDialog({
  category,
  categories,
  products,
  onClose,
}: {
  category: CategoryDef | null;
  categories: CategoryDef[];
  products: Product[];
  onClose: () => void;
}) {
  const router = useRouter();
  const showToast = useToast((s) => s.show);
  const [busy, setBusy] = useState(false);

  const productsInCat = useMemo(
    () => (category ? products.filter((p) => p.category === category.slug) : []),
    [products, category],
  );
  const otherCategories = useMemo(
    () =>
      categories
        .filter((c) => !category || c.slug !== category.slug)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, category],
  );

  const [action, setAction] = useState<Action>("move");
  const [targetSlug, setTargetSlug] = useState<string>("");

  useEffect(() => {
    if (!category) return;
    setAction("move");
    setTargetSlug(otherCategories[0]?.slug ?? "");
  }, [category, otherCategories]);

  useEffect(() => {
    if (!category) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [category, onClose]);

  if (!category) return null;

  async function handleConfirm() {
    if (!category?.id) {
      showToast("Falta el id de la categoría");
      return;
    }
    setBusy(true);
    const client = createBrowserApiClient();
    try {
      if (productsInCat.length > 0) {
        if (action === "move") {
          if (!targetSlug) return;
          await Promise.all(
            productsInCat.map((p) =>
              client.admin.products.update(p.id, { category: targetSlug }),
            ),
          );
        } else {
          await Promise.all(
            productsInCat.map((p) => client.admin.products.remove(p.id)),
          );
        }
      }
      await client.admin.categories.remove(category.id);
      showToast(`Categoría eliminada: ${category.title}`);
      router.refresh();
      onClose();
    } catch (err) {
      const msg = err instanceof ApiError ? `Error ${err.status}` : "Sin conexión";
      showToast(`No se pudo eliminar (${msg})`);
    } finally {
      setBusy(false);
    }
  }

  const hasProducts = productsInCat.length > 0;
  const canConfirm =
    !busy && (!hasProducts || action === "delete-products" || !!targetSlug);
  const hasAlternatives = otherCategories.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-ink)]/45 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-t-md border-x border-t border-[var(--color-line)] bg-[var(--color-canvas)] sm:rounded-md sm:border">
        <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-700">
            Eliminar categoría
          </span>
          <h2 className="font-display text-lg text-[var(--color-ink)]">{category.title}</h2>
        </header>

        <div className="space-y-4 px-5 py-4 text-sm text-[var(--color-ink-soft)]">
          {!hasProducts && (
            <p>La categoría no contiene productos. Se eliminará del catálogo.</p>
          )}

          {hasProducts && (
            <>
              <p>
                Esta categoría tiene{" "}
                <strong className="font-semibold text-[var(--color-ink)]">
                  {productsInCat.length} producto
                  {productsInCat.length === 1 ? "" : "s"}
                </strong>
                . ¿Qué hacemos con ellos?
              </p>

              <div className="space-y-2">
                <RadioRow
                  checked={action === "move"}
                  onChange={() => setAction("move")}
                  disabled={!hasAlternatives}
                  label="Mover a otra categoría"
                >
                  <select
                    disabled={action !== "move" || !hasAlternatives}
                    value={targetSlug}
                    onChange={(e) => setTargetSlug(e.target.value)}
                    className="mt-2 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm disabled:opacity-50 focus:border-brand-700 focus:outline-none"
                  >
                    {otherCategories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.icon} {c.title}
                      </option>
                    ))}
                  </select>
                  {!hasAlternatives && (
                    <p className="mt-1 text-[11px] text-rose-700">
                      No hay otras categorías disponibles.
                    </p>
                  )}
                </RadioRow>

                <RadioRow
                  checked={action === "delete-products"}
                  onChange={() => setAction("delete-products")}
                  label="Eliminar productos también"
                  tone="danger"
                />
              </div>
            </>
          )}
        </div>

        <footer className="flex gap-2 border-t border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-md border border-[var(--color-line)] py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 rounded-md border border-rose-800 bg-rose-700 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "…" : "Eliminar"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function RadioRow({
  checked,
  onChange,
  disabled,
  label,
  tone = "neutral",
  children,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
  tone?: "neutral" | "danger";
  children?: React.ReactNode;
}) {
  return (
    <label
      className={`block rounded-md border p-3 transition ${
        checked
          ? tone === "danger"
            ? "border-rose-300 bg-rose-50"
            : "border-brand-300 bg-brand-50"
          : "border-[var(--color-line)] bg-[var(--color-surface)]"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="h-4 w-4 accent-brand-700"
        />
        {label}
      </span>
      {checked && children}
    </label>
  );
}
