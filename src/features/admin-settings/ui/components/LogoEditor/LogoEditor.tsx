"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/shared/components/atoms/button";
import { toUiMessage } from "@/shared/lib/errors";
import { useRemoveLogo, useUploadLogo } from "../../../api/useSettings";

export function LogoEditor({ logoUrl }: { logoUrl: string }) {
  const upload = useUploadLogo();
  const remove = useRemoveLogo();
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = upload.isPending || remove.isPending;
  const hasLogo = !!logoUrl;

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      toast.success("Logo actualizado");
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos subir el logo"));
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove() {
    if (!confirm("¿Quitar el logo actual?")) return;
    try {
      await remove.mutateAsync();
      toast.success("Logo quitado");
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos quitar el logo"));
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-muted/40">
        {hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Logo actual"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImagePlus className="h-6 w-6" aria-hidden />
            <span className="text-[10px] font-medium">Sin logo</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">
            {hasLogo ? "Logo actual" : "Sube tu logo"}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG o WebP. Idealmente cuadrado o horizontal con fondo
            transparente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={onFileChange}
            className="sr-only"
            aria-label="Subir logo"
          />
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            variant={hasLogo ? "outline" : "default"}
            className="gap-1.5"
          >
            {upload.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {hasLogo ? "Reemplazar" : "Subir logo"}
          </Button>
          {hasLogo && (
            <Button
              type="button"
              onClick={onRemove}
              disabled={busy}
              variant="ghost"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {remove.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
              Quitar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
