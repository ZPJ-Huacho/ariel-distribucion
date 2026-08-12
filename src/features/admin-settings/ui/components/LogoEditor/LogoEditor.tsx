"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/shared/components/atoms/button";
import { cn } from "@/shared/lib/utils";
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
    <div className="flex flex-col gap-4">
      {hasLogo ? (
        <div>
          <div className="grid grid-cols-3 gap-2 sm:max-w-md">
            <LogoSwatch label="Claro" tone="light" src={logoUrl} />
            <LogoSwatch label="Oscuro" tone="dark" src={logoUrl} />
            <LogoSwatch label="Transparente" tone="checker" src={logoUrl} />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Así se ve tu logo sobre distintos fondos. Un logo blanco no se ve en
            &ldquo;Claro&rdquo;, uno negro no se ve en &ldquo;Oscuro&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-muted/40">
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImagePlus className="h-6 w-6" aria-hidden />
            <span className="text-[10px] font-medium">Sin logo</span>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-2">
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

// Preview del logo sobre distintos fondos. "checker" = fondo tipo Photoshop
// para ver la transparencia real. Es un data-URI de dos triángulos grises,
// tileado 12px, así no pega ningún asset externo.
const CHECKER_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><rect width='6' height='6' fill='%23e5e7eb'/><rect x='6' y='6' width='6' height='6' fill='%23e5e7eb'/></svg>\")";

function LogoSwatch({
  label,
  tone,
  src,
}: {
  label: string;
  tone: "light" | "dark" | "checker";
  src: string;
}) {
  const style =
    tone === "checker"
      ? { backgroundImage: CHECKER_BG, backgroundColor: "#ffffff" }
      : undefined;
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "grid aspect-square place-items-center overflow-hidden rounded-xl border p-2",
          tone === "light" && "border-border/60 bg-white",
          tone === "dark" && "border-white/10 bg-neutral-900",
        )}
        style={style}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Logo sobre fondo ${label.toLowerCase()}`}
          className="h-full w-full object-contain"
        />
      </div>
      <p className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
