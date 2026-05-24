"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { z } from "zod";
import { ApiError } from "@mercabana/core";
import type { CategoryDef, Product } from "@mercabana/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserApiClient } from "@/lib/api";
import { useToast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

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

function extractR2Key(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const idx = url.indexOf("/r2/");
  if (idx >= 0) return url.slice(idx + 4);
  return url; // data URL legacy o externo absoluto — se manda tal cual
}

async function compressImageToBlob(file: File): Promise<Blob> {
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
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new Error("No se pudo generar el JPEG");
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

type Mode = { type: "new" } | { type: "edit"; product: Product };

export function ProductEditor({
  mode,
  categories,
  onClose,
}: {
  mode: Mode | null;
  categories: CategoryDef[];
  onClose: () => void;
}) {
  const router = useRouter();
  const showToast = useToast((s) => s.show);
  const [saving, setSaving] = useState(false);

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

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImageToBlob(file);
      const form = new FormData();
      form.append("file", compressed, "product.jpg");
      const { url } = await createBrowserApiClient().admin.uploads.create(form);
      update("imageUrl", url);
    } catch (err) {
      const msg = err instanceof ApiError ? `Error ${err.status}` : "Error inesperado";
      showToast(`No se pudo subir la imagen (${msg})`);
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
    if (!mode) return;

    setSaving(true);
    const client = createBrowserApiClient();
    const payload = {
      name: data.name,
      description: data.description ?? "",
      price: data.price,
      unit: data.unit,
      category: data.category,
      emoji: data.emoji,
      gradient: "",
      isAvailable: data.isAvailable,
      isHighlighted: data.isHighlighted,
      // El backend almacena la key R2 (no la URL absoluta). Si data.imageUrl
      // viene de /r2/<key>, extraemos la key; data URLs legacy se envían
      // tal cual.
      imageR2Key: extractR2Key(data.imageUrl) ?? null,
    };
    try {
      if (mode.type === "new") {
        await client.admin.products.create(payload);
        showToast(`Añadido: ${data.name}`);
      } else {
        await client.admin.products.update(mode.product.id, payload);
        showToast(`Actualizado: ${data.name}`);
      }
      router.refresh();
      onClose();
    } catch (err) {
      const msg = err instanceof ApiError ? `Error ${err.status}` : "Sin conexión";
      showToast(`No se pudo guardar (${msg})`);
    } finally {
      setSaving(false);
    }
  }

  const title = mode?.type === "new" ? "Nuevo producto" : "Editar producto";

  return (
    <Sheet open={!!mode} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {mode?.type === "new"
              ? "Añade un nuevo producto al catálogo."
              : "Edita los datos del producto."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
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

            <Field label="Nombre" error={errors.name} id="name">
              <Input
                id="name"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Naranjas de mesa"
              />
            </Field>
            <Field label="Descripción" error={errors.description} id="description">
              <Textarea
                id="description"
                value={values.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
                placeholder="Dulces, jugosas, perfectas para zumo."
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio (€)" error={errors.price} id="price">
                <Input
                  id="price"
                  type="number"
                  step="0.5"
                  min="0"
                  value={Number.isNaN(values.price) ? "" : values.price}
                  onChange={(e) => update("price", parseFloat(e.target.value))}
                  className="tabular-nums"
                />
              </Field>
              <Field label="Unidad" error={errors.unit} id="unit">
                <Input
                  id="unit"
                  value={values.unit}
                  onChange={(e) => update("unit", e.target.value)}
                  placeholder="caja 10 kg"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoría" error={errors.category} id="category">
                <Select
                  value={values.category}
                  onValueChange={(v) => update("category", v ?? "")}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedCategories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.icon} {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Emoji"
                hint="Aparece si no hay foto"
                error={errors.emoji}
                id="emoji"
              >
                <Input
                  id="emoji"
                  value={values.emoji}
                  onChange={(e) => update("emoji", e.target.value)}
                  maxLength={4}
                  className="text-center text-xl"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ToggleChip
                label="Disponible hoy"
                checked={values.isAvailable}
                onChange={(v) => update("isAvailable", v)}
              />
              <ToggleChip
                label="Destacar"
                checked={values.isHighlighted}
                onChange={(v) => update("isHighlighted", v)}
              />
            </div>
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
    <div className="space-y-1.5">
      <Label>Foto</Label>
      <div className="flex items-center gap-3">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl opacity-80" aria-hidden>
              {emoji}
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/60 text-[10px] font-semibold uppercase tracking-wider text-background">
              Subiendo
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPick}
            disabled={uploading}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {imageUrl ? "Cambiar foto" : "Subir foto"}
          </Button>
          {imageUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Quitar
            </Button>
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

function ToggleChip({
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
      aria-pressed={checked}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[12.5px] font-medium transition",
        checked
          ? "border-primary/40 bg-accent text-accent-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background",
        )}
        aria-hidden
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

