"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, TagIcon } from "lucide-react";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/atoms/dialog";
import { useCreateCategory } from "../../../api/useCategories";
import { toUiMessage } from "@/shared/lib/errors";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function slugify(s: string): string {
  return normalize(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryFormDialog({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const create = useCreateCategory();

  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = open ?? internalOpen;
  const setActualOpen = onOpenChange ?? setInternalOpen;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (actualOpen) {
      setTitle("");
      setSlug("");
      setSlugTouched(false);
    }
  }, [actualOpen]);

  const busy = create.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !title) {
      toast.error("Completa nombre y slug.");
      return;
    }
    try {
      await create.mutateAsync({ slug, title, icon: "", lead: "" });
      toast.success("Categoría creada");
      setActualOpen(false);
    } catch (err) {
      const kind = (err as { kind?: string } | undefined)?.kind;
      if (kind === "conflict") toast.error("Ese slug ya existe");
      else toast.error(toUiMessage(err, "No pudimos crear la categoría"));
    }
  }

  return (
    <Dialog open={actualOpen} onOpenChange={setActualOpen}>
      <DialogContent
        className="flex w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <header className="flex items-center gap-3 border-b p-4 sm:p-5">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"
          >
            <TagIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Nueva
            </p>
            <h2 className="text-base font-semibold sm:text-lg">
              Crear categoría
            </h2>
          </div>
        </header>

        <form onSubmit={submit} className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5">
          <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-title">Nombre</Label>
                <Input
                  id="cat-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Frutas frescas"
                  required
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-slug" className="flex items-center justify-between">
                  <span>Slug</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    URL amigable
                  </span>
                </Label>
                <Input
                  id="cat-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  placeholder="frutas-frescas"
                  required
                  className="font-mono text-sm"
                />
              </div>
          </div>
        </form>

        <footer className="flex flex-col-reverse items-stretch gap-2 border-t bg-muted/40 p-4 sm:flex-row sm:justify-end sm:p-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActualOpen(false)}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={busy || !slug || !title}
            className="rounded-full"
          >
            {busy && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            )}
            {busy ? "Creando…" : "Crear categoría"}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
