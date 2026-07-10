"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Loader2,
  NotebookPen,
  PackagePlus,
  Save,
  Sparkles,
} from "lucide-react";
import type { Product } from "@/core/products";
import { useCategories } from "@/features/admin-categories/api/useCategories";
import { useSettingsQuery } from "@/features/admin-settings/api/useSettings";
import {
  useCreateProduct,
  useGenerateAIDescription,
  useGenerateAIImage,
  useUpdateProduct,
  useUploadProductImage,
} from "../../../api/useProducts";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { Textarea } from "@/shared/components/atoms/textarea";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/atoms/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import { toUiMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";

type FormState = {
  name: string;
  description: string;
  price: string;
  unit: string;
  category: string;
  isAvailable: boolean;
  isHighlighted: boolean;
};

function initial(product?: Product, defaultCategory = ""): FormState {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    unit: product?.unit ?? "",
    category: product?.category ?? defaultCategory,
    isAvailable: product?.isAvailable ?? true,
    isHighlighted: product?.isHighlighted ?? false,
  };
}

export function ProductFormDialog({
  product,
  open,
  onOpenChange,
}: {
  product?: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isEdit = !!product;
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettingsQuery();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const upload = useUploadProductImage();
  const generateAI = useGenerateAIImage();
  const generateAIDesc = useGenerateAIDescription();

  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = open ?? internalOpen;
  const setActualOpen = onOpenChange ?? setInternalOpen;

  const [form, setForm] = useState<FormState>(() =>
    initial(product, categories[0]?.slug),
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    product?.imageUrl ?? null,
  );

  useEffect(() => {
    if (actualOpen) {
      setForm(initial(product, categories[0]?.slug));
      setFile(null);
      setPreview(product?.imageUrl ?? null);
    }
  }, [actualOpen, product, categories]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // busy es sólo para el submit (Cancelar/Crear/Guardar). Los botones de IA
  // se deshabilitan sólo por su propia acción para no bloquearse entre sí.
  const busy = create.isPending || update.isPending || upload.isPending;
  const aiEnabled = !!settings?.aiEnabled;
  const priceNum = Number(form.price);
  // Imagen necesita todos los campos requeridos (porque guardamos el producto si no existe)
  const requiredOk =
    !!form.name.trim() &&
    !!form.unit.trim() &&
    !!form.category &&
    priceNum > 0;
  const canGenerateImage = aiEnabled && requiredOk;
  // Descripción solo necesita nombre (no guarda producto, solo devuelve texto)
  const canGenerateDescription = aiEnabled && !!form.name.trim();
  const imageDisabledReason = !form.name.trim()
    ? "Pon un nombre al producto."
    : !form.category
      ? "Elige una categoría."
      : !(priceNum > 0)
        ? "Añade un precio válido."
        : !form.unit.trim()
          ? "Añade la unidad (ej: caja 5 kg)."
          : "";

  /** Guarda el producto si aún no existe y devuelve su ID. */
  async function ensureProductId(): Promise<string | null> {
    if (product?.id) return product.id;
    if (!requiredOk) {
      toast.error("Completa los campos requeridos antes de generar.");
      return null;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: priceNum,
      unit: form.unit,
      emoji: "📦",
      gradient: "",
      category: form.category,
      isAvailable: form.isAvailable,
      isHighlighted: form.isHighlighted,
    };
    const created = await create.mutateAsync(payload);
    return created.id;
  }

  async function handleGenerateImage() {
    if (!aiEnabled) return;
    try {
      const id = await ensureProductId();
      if (!id) return;
      const result = await generateAI.mutateAsync(id);
      setPreview(result.url);
      setFile(null);
      toast.success(`Imagen generada · ${result.used}/${result.limit}`);
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos generar la imagen"));
    }
  }

  async function handleGenerateDescription() {
    if (!aiEnabled || !form.name.trim()) return;
    try {
      const result = await generateAIDesc.mutateAsync(form.name.trim());
      setForm((f) => ({ ...f, description: result.description }));
      toast.success("Descripción generada");
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos generar la descripción"));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = Number(form.price);
    if (!form.name || !form.unit || !form.category || !(priceNum > 0)) {
      toast.error("Revisa los campos requeridos.");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: priceNum,
      unit: form.unit,
      emoji: "📦",
      gradient: "",
      category: form.category,
      isAvailable: form.isAvailable,
      isHighlighted: form.isHighlighted,
    };

    try {
      let id = product?.id;
      if (isEdit && id) {
        await update.mutateAsync({ id, patch: payload });
      } else {
        const created = await create.mutateAsync(payload);
        id = created.id;
      }
      if (file && id) await upload.mutateAsync({ id, file });
      toast.success(isEdit ? "Producto actualizado" : "Producto creado");
      setActualOpen(false);
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos guardar el producto"));
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  }

  return (
    <Dialog open={actualOpen} onOpenChange={setActualOpen}>
      <DialogContent
        className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-2xl"
        showCloseButton={false}
      >
        <header className="flex items-center gap-3 border-b bg-card p-4 sm:p-5">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"
          >
            {isEdit ? (
              <Save className="h-5 w-5" />
            ) : (
              <PackagePlus className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {isEdit ? "Editar" : "Nuevo"}
            </p>
            <h2 className="text-base font-semibold sm:text-lg">
              {isEdit ? product.name : "Crear producto"}
            </h2>
          </div>
        </header>

        <form
          onSubmit={submit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:gap-5 sm:p-5"
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <label className="group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-muted/40 transition-colors hover:border-primary/60 hover:bg-primary/5">
                {generateAI.isPending ? (
                  <div className="flex flex-col items-center gap-1 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    <span className="text-[10px] font-medium">Generando…</span>
                  </div>
                ) : preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImageIcon className="h-5 w-5" aria-hidden />
                    <span className="text-[10px] font-medium">Imagen</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onFileChange}
                  className="sr-only"
                  aria-label="Imagen del producto"
                />
              </label>

              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="p-name">Nombre</Label>
                <Input
                  id="p-name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Manzanas fuji"
                  required
                />
              </div>
            </div>

            {aiEnabled && (
              <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 text-xs">
                    <ImageIcon
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="font-semibold text-foreground">
                        Generar imagen con IA
                      </span>{" "}
                      <span className="text-muted-foreground">
                        · caja rústica con tu marca
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={
                      !canGenerateImage ||
                      generateAI.isPending ||
                      create.isPending
                    }
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all",
                      "hover:bg-primary/90",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {generateAI.isPending || create.isPending ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {generateAI.isPending || create.isPending
                      ? "Generando…"
                      : isEdit
                        ? "Generar imagen"
                        : "Guardar y generar imagen"}
                  </button>
                </div>
                {!canGenerateImage &&
                  !generateAI.isPending &&
                  !create.isPending &&
                  imageDisabledReason && (
                    <p className="text-[11px] text-muted-foreground">
                      {imageDisabledReason}
                    </p>
                  )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="p-desc">Descripción</Label>
              {aiEnabled && (
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={
                    !canGenerateDescription || generateAIDesc.isPending
                  }
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary transition-colors",
                    "hover:bg-primary/15",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  title={
                    !form.name.trim()
                      ? "Pon un nombre al producto primero"
                      : "Generar descripción con IA a partir del nombre"
                  }
                >
                  {generateAIDesc.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                  ) : (
                    <NotebookPen className="h-3 w-3" aria-hidden />
                  )}
                  {generateAIDesc.isPending
                    ? "Generando…"
                    : "Generar con IA"}
                </button>
              )}
            </div>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
              placeholder="Notas cortas para el cliente"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-price">Precio (€)</Label>
              <Input
                id="p-price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-unit">Unidad</Label>
              <Input
                id="p-unit"
                value={form.unit}
                onChange={(e) => setField("unit", e.target.value)}
                placeholder="caja 5 kg"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-cat">Categoría</Label>
            <Select
              value={form.category || undefined}
              onValueChange={(v) => setField("category", String(v))}
            >
              <SelectTrigger id="p-cat" className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    <span aria-hidden className="text-base leading-none">
                      {c.icon}
                    </span>
                    <span>{c.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:justify-between">
            <ToggleRow
              label="Disponible"
              hint="Los clientes pueden añadirlo al carrito"
              checked={form.isAvailable}
              onChange={(v) => setField("isAvailable", v)}
            />
            <ToggleRow
              label="Destacado"
              hint="Aparece en Top de productos"
              checked={form.isHighlighted}
              onChange={(v) => setField("isHighlighted", v)}
            />
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
            disabled={busy}
            className="rounded-full"
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : isEdit ? (
              <Save className="mr-2 h-4 w-4" aria-hidden />
            ) : (
              <PackagePlus className="mr-2 h-4 w-4" aria-hidden />
            )}
            {busy
              ? "Guardando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear producto"}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="flex flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
    >
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
