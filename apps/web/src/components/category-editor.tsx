"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ApiError } from "@mercabana/core";
import type { CategoryDef } from "@mercabana/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createBrowserApiClient } from "@/lib/api";
import { useToast } from "@/lib/toast-store";

type Mode =
  | { type: "new" }
  | { type: "edit"; category: CategoryDef }
  | null;

const schema = z.object({
  title: z.string().min(2, "Pon un título."),
  lead: z.string().max(120, "Máximo 120 caracteres.").optional().default(""),
  slug: z
    .string()
    .min(2, "Pon un slug.")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones."),
  icon: z.string().min(1, "Pon un icono o emoji."),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  title: "",
  lead: "",
  slug: "",
  icon: "🥕",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 32);
}

export function CategoryEditor({
  mode,
  categories,
  onClose,
}: {
  mode: Mode;
  categories: CategoryDef[];
  onClose: () => void;
}) {
  const router = useRouter();
  const showToast = useToast((s) => s.show);
  const [saving, setSaving] = useState(false);

  const initial = useMemo<FormValues>(() => {
    if (!mode || mode.type === "new") return defaultValues;
    const c = mode.category;
    return { title: c.title, lead: c.lead, slug: c.slug, icon: c.icon };
  }, [mode]);

  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (mode) {
      setValues(initial);
      setErrors({});
      setSlugTouched(mode.type === "edit");
    }
  }, [mode, initial]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (key === "title" && !slugTouched && mode?.type === "new") {
        next.slug = slugify(String(value));
      }
      return next;
    });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormValues;
        fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    const data = parsed.data;
    const existsElsewhere = categories.some(
      (c) =>
        c.slug === data.slug &&
        (mode?.type !== "edit" || c.slug !== mode.category.slug),
    );
    if (existsElsewhere) {
      setErrors({ slug: "Ya existe una categoría con ese slug." });
      return;
    }
    if (!mode) return;

    setSaving(true);
    const client = createBrowserApiClient();
    const payload = {
      slug: data.slug,
      title: data.title,
      lead: data.lead ?? "",
      icon: data.icon,
    };
    try {
      if (mode.type === "new") {
        await client.admin.categories.create(payload);
        showToast(`Categoría creada: ${data.title}`);
      } else {
        if (!mode.category.id) {
          showToast("Falta el id de la categoría");
          return;
        }
        await client.admin.categories.update(mode.category.id, payload);
        showToast(`Categoría actualizada: ${data.title}`);
      }
      router.refresh();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ slug: "Ya existe una categoría con ese slug." });
      } else {
        const msg = err instanceof ApiError ? `Error ${err.status}` : "Sin conexión";
        showToast(`No se pudo guardar (${msg})`);
      }
    } finally {
      setSaving(false);
    }
  }

  const title = mode?.type === "new" ? "Nueva categoría" : "Editar categoría";

  return (
    <Sheet open={!!mode} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Las categorías aparecen como secciones en el catálogo.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <Field label="Icono" error={errors.icon} id="icon">
                <Input
                  id="icon"
                  value={values.icon}
                  onChange={(e) => update("icon", e.target.value)}
                  maxLength={4}
                  className="text-center text-xl"
                />
              </Field>
              <Field label="Título" error={errors.title} id="title">
                <Input
                  id="title"
                  value={values.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Frutas de temporada"
                />
              </Field>
            </div>

            <Field
              label="Subtítulo"
              hint="Aparece debajo del título en el catálogo"
              error={errors.lead}
              id="lead"
            >
              <Input
                id="lead"
                value={values.lead ?? ""}
                onChange={(e) => update("lead", e.target.value)}
                placeholder="Recogidas en lonja a primera hora"
              />
            </Field>

            <Field
              label="Slug"
              hint="Identificador en la URL (ej: ?cat=frutas)"
              error={errors.slug}
              id="slug"
            >
              <Input
                id="slug"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value);
                }}
                placeholder="frutas"
                className="font-mono"
              />
            </Field>
          </div>

          <SheetFooter className="flex-row gap-2 border-t border-border bg-card px-5 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  hint,
  error,
  id,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p className="text-[11.5px] text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-[11.5px] font-medium text-destructive">{error}</p>}
    </div>
  );
}
