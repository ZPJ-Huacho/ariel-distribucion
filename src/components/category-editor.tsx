"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import type { CategoryDef } from "@/lib/data/types";
import { slugify, useCategories } from "@/lib/categories-store";
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

export function CategoryEditor({
  mode,
  onClose,
}: {
  mode: Mode;
  onClose: () => void;
}) {
  const categories = useCategories((s) => s.categories);
  const addCategory = useCategories((s) => s.addCategory);
  const updateCategory = useCategories((s) => s.updateCategory);
  const showToast = useToast((s) => s.show);

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

  useEffect(() => {
    if (!mode) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mode, onClose]);

  if (!mode) return null;

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

  function handleSubmit(e: React.FormEvent) {
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
      (c) => c.slug === data.slug && (mode?.type !== "edit" || c.slug !== mode.category.slug),
    );
    if (existsElsewhere) {
      setErrors({ slug: "Ya existe una categoría con ese slug." });
      return;
    }
    if (!mode) return;
    if (mode.type === "new") {
      addCategory({
        slug: data.slug,
        title: data.title,
        lead: data.lead ?? "",
        icon: data.icon,
      });
      showToast(`Categoría creada: ${data.title}`);
    } else {
      updateCategory(mode.category.slug, {
        slug: data.slug,
        title: data.title,
        lead: data.lead ?? "",
        icon: data.icon,
      });
      showToast(`Categoría actualizada: ${data.title}`);
    }
    onClose();
  }

  const title = mode.type === "new" ? "Nueva categoría" : "Editar categoría";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-ink)]/45 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-md flex-col overflow-hidden rounded-t-md border-x border-t border-[var(--color-line)] bg-[var(--color-canvas)] sm:rounded-md sm:border"
      >
        <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3.5">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-700">
              Catálogo
            </span>
            <h2 className="font-display text-lg text-[var(--color-ink)]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md border border-[var(--color-line)] p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <Field label="Icono" error={errors.icon}>
              <input
                type="text"
                value={values.icon}
                onChange={(e) => update("icon", e.target.value)}
                maxLength={4}
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-2.5 text-center text-2xl focus:border-brand-700 focus:outline-none"
              />
            </Field>
            <Field label="Título" error={errors.title}>
              <input
                type="text"
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Frutas de temporada"
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
              />
            </Field>
          </div>

          <Field
            label="Subtítulo"
            hint="Aparece debajo del título en el catálogo"
            error={errors.lead}
          >
            <input
              type="text"
              value={values.lead ?? ""}
              onChange={(e) => update("lead", e.target.value)}
              placeholder="Recogidas en lonja a primera hora"
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
            />
          </Field>

          <Field
            label="Slug"
            hint="Identificador en la URL (ej: ?cat=frutas)"
            error={errors.slug}
          >
            <input
              type="text"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              placeholder="frutas"
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 font-mono text-sm focus:border-brand-700 focus:outline-none"
            />
          </Field>
        </div>

        <footer className="flex gap-2 border-t border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-[var(--color-line)] py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-md border border-brand-900 bg-brand-800 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-100 hover:bg-brand-900"
          >
            Guardar
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-[11px] text-[var(--color-ink-mute)]">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-rose-700">{error}</span>
      )}
    </label>
  );
}
