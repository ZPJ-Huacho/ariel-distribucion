"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { ApiError } from "@mercabana/core";
import type { CategoryDef, Product } from "@mercabana/core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserApiClient } from "@/lib/api";
import { useToast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

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
    <Dialog open={!!category} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            Eliminar &quot;{category?.title}&quot;
          </DialogTitle>
          <DialogDescription className="text-center">
            {hasProducts
              ? `Esta categoría tiene ${productsInCat.length} producto${
                  productsInCat.length === 1 ? "" : "s"
                }. ¿Qué hacemos con ellos?`
              : "La categoría no contiene productos. Se eliminará del catálogo."}
          </DialogDescription>
        </DialogHeader>

        {hasProducts && (
          <div className="space-y-2">
            <ActionOption
              checked={action === "move"}
              onSelect={() => setAction("move")}
              disabled={!hasAlternatives}
              label="Mover a otra categoría"
            >
              <Select
                disabled={action !== "move" || !hasAlternatives}
                value={targetSlug}
                onValueChange={(v) => setTargetSlug(v ?? "")}
              >
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {otherCategories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.icon} {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!hasAlternatives && (
                <p className="mt-1 text-[11.5px] text-destructive">
                  No hay otras categorías disponibles.
                </p>
              )}
            </ActionOption>

            <ActionOption
              checked={action === "delete-products"}
              onSelect={() => setAction("delete-products")}
              label="Eliminar productos también"
              tone="danger"
            />
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:flex-none"
          >
            {busy ? "…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionOption({
  checked,
  onSelect,
  disabled,
  label,
  tone = "neutral",
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  disabled?: boolean;
  label: string;
  tone?: "neutral" | "danger";
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "block w-full rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? tone === "danger"
            ? "border-destructive/40 bg-destructive/5"
            : "border-primary/40 bg-accent"
          : "border-border bg-card hover:border-foreground/30",
      )}
    >
      <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
            checked
              ? tone === "danger"
                ? "border-destructive bg-destructive"
                : "border-primary bg-primary"
              : "border-border bg-background",
          )}
        >
          {checked && (
            <span className="h-1.5 w-1.5 rounded-full bg-background" />
          )}
        </span>
        {label}
      </span>
      {checked && children}
    </button>
  );
}
