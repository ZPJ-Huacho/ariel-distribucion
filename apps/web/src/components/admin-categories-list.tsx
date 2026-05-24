"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { CategoryDef, Product } from "@mercabana/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Catálogo
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-foreground">
            Categorías
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {sorted.length} categoría{sorted.length === 1 ? "" : "s"} activa
            {sorted.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button onClick={() => setEditor({ type: "new" })} className="self-start">
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-muted-foreground">
              Aún no hay categorías. Crea una para empezar.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {sorted.map((cat) => {
                const count = counts[cat.slug] ?? 0;
                return (
                  <li
                    key={cat.slug}
                    className="flex items-center gap-3 px-4 py-3.5"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl"
                      aria-hidden
                    >
                      {cat.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14.5px] font-semibold text-foreground">
                          {cat.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className="rounded-full text-[10.5px]"
                        >
                          {count} producto{count === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      <div className="truncate text-[12px] text-muted-foreground">
                        {cat.lead || "Sin subtítulo"} ·{" "}
                        <span className="font-mono">{cat.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditor({ type: "edit", category: cat })}
                        aria-label="Editar"
                        className="h-8 w-8"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(cat)}
                        disabled={count > 0}
                        aria-label="Eliminar"
                        title={
                          count > 0
                            ? "Mueve o borra primero los productos"
                            : undefined
                        }
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
