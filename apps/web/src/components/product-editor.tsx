"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import type { Product } from "@mercabana/core";
import { useProducts } from "@/lib/products-store";
import { useCategories } from "@/lib/categories-store";
import { useToast } from "@/lib/toast-store";

const schema = z.object({
  name: z.string().min(2, "Pon un nombre."),
  description: z.string().max(160, "Máximo 160 caracteres.").optional().default(""),
  price: z
    .number({ message: "Pon un precio." })
    .positive("El precio debe ser mayor que 0."),
  unit: z.string().min(2, "Indica la unidad (ej: caja 10 kg)."),
  category: z.string().min(1, "Elige una categoría."),
  emoji: z.string().min(1, "Elige un emoji o pega uno."),
  isAvailable: z.boolean(),
  isHighlighted: z.boolean(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  description: "",
  price: 0,
  unit: "",
  category: "frutas",
  emoji: "🍊",
  isAvailable: true,
  isHighlighted: false,
  imageUrl: undefined,
};

const MAX_DIMENSION = 720;
const JPEG_QUALITY = 0.75;

async function compressImage(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen"));
      el.src = objectUrl;
    });
    const ratio = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height, 1);
    const width = Math.round(img.width * ratio);
    const height = Math.round(img.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no disponible");
    ctx.fillStyle = "#f6f1e7";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

type Mode = { type: "new" } | { type: "edit"; product: Product };

export function ProductEditor({
  mode,
  onClose,
}: {
  mode: Mode | null;
  onClose: () => void;
}) {
  const addProduct = useProducts((s) => s.addProduct);
  const updateProduct = useProducts((s) => s.updateProduct);
  const categories = useCategories((s) => s.categories);
  const showToast = useToast((s) => s.show);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  const initial = useMemo<FormValues>(() => {
    const fallbackSlug = sortedCategories[0]?.slug ?? "frutas";
    if (!mode || mode.type === "new")
      return { ...defaultValues, category: fallbackSlug };
    const p = mode.product;
    return {
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      unit: p.unit,
      category: p.category,
      emoji: p.emoji,
      isAvailable: p.isAvailable,
      isHighlighted: !!p.isHighlighted,
      imageUrl: p.imageUrl,
    };
  }, [mode, sortedCategories]);

  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode) {
      setValues(initial);
      setErrors({});
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
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      update("imageUrl", dataUrl);
    } catch (err) {
      showToast("No se pudo procesar la imagen");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
    if (!mode) return;
    if (mode.type === "new") {
      addProduct({
        name: data.name,
        description: data.description ?? "",
        price: data.price,
        unit: data.unit,
        category: data.category,
        emoji: data.emoji,
        gradient: "from-stone-200 to-stone-400",
        isAvailable: data.isAvailable,
        isHighlighted: data.isHighlighted,
        imageUrl: data.imageUrl,
      });
      showToast(`Añadido: ${data.name}`);
    } else {
      updateProduct(mode.product.id, {
        name: data.name,
        description: data.description ?? "",
        price: data.price,
        unit: data.unit,
        category: data.category,
        emoji: data.emoji,
        isAvailable: data.isAvailable,
        isHighlighted: data.isHighlighted,
        imageUrl: data.imageUrl,
      });
      showToast(`Actualizado: ${data.name}`);
    }
    onClose();
  }

  const title = mode.type === "new" ? "Nuevo producto" : "Editar producto";

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
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-md border-x border-t border-[var(--color-line)] bg-[var(--color-canvas)] sm:rounded-md sm:border"
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

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <ImageField
            imageUrl={values.imageUrl}
            emoji={values.emoji}
            uploading={uploading}
            onPick={() => fileInputRef.current?.click()}
            onRemove={() => update("imageUrl", undefined)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          <Field label="Nombre" error={errors.name}>
            <input
              type="text"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Naranjas de mesa"
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
            />
          </Field>

          <Field label="Descripción" error={errors.description}>
            <textarea
              value={values.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="Dulces, jugosas, perfectas para zumo."
              className="w-full resize-none rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio (€)" error={errors.price}>
              <input
                type="number"
                step="0.5"
                min="0"
                value={Number.isNaN(values.price) ? "" : values.price}
                onChange={(e) => update("price", parseFloat(e.target.value))}
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm tabular-nums focus:border-brand-700 focus:outline-none"
              />
            </Field>
            <Field label="Unidad" error={errors.unit}>
              <input
                type="text"
                value={values.unit}
                onChange={(e) => update("unit", e.target.value)}
                placeholder="caja 10 kg"
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría" error={errors.category}>
              <select
                value={values.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus:border-brand-700 focus:outline-none"
              >
                {sortedCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.icon} {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Emoji" error={errors.emoji} hint="Aparece si no hay foto">
              <input
                type="text"
                value={values.emoji}
                onChange={(e) => update("emoji", e.target.value)}
                maxLength={4}
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-center text-2xl focus:border-brand-700 focus:outline-none"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Checkbox
              label="Disponible hoy"
              checked={values.isAvailable}
              onChange={(v) => update("isAvailable", v)}
            />
            <Checkbox
              label="Destacar"
              checked={values.isHighlighted}
              onChange={(v) => update("isHighlighted", v)}
            />
          </div>
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

function ImageField({
  imageUrl,
  emoji,
  uploading,
  onPick,
  onRemove,
}: {
  imageUrl?: string;
  emoji: string;
  uploading: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        Foto
      </span>
      <div className="flex items-center gap-3">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-canvas-soft)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl opacity-80" aria-hidden>
              {emoji}
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-[var(--color-ink)]/60 text-[10px] font-semibold uppercase tracking-wider text-white">
              Subiendo
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onPick}
            disabled={uploading}
            className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft)] disabled:opacity-50"
          >
            {imageUrl ? "Cambiar foto" : "Subir foto"}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-mute)] hover:text-rose-700"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-[12px] font-medium transition ${
        checked
          ? "border-brand-700 bg-brand-50 text-brand-800"
          : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-soft)]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
          checked
            ? "border-brand-700 bg-brand-700 text-white"
            : "border-[var(--color-line)] bg-white"
        }`}
        aria-hidden
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
