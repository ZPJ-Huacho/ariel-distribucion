"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, ExternalLink, Palette, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import { cn } from "@/shared/lib/utils";

type Palette = "brand" | "black" | "inverted";

const PALETTES: {
  id: Palette;
  label: string;
  fg: string;
  bg: string;
}[] = [
  { id: "brand", label: "Marca (verde)", fg: "var(--primary)", bg: "#ffffff" },
  { id: "black", label: "Negro clásico", fg: "#111111", bg: "#ffffff" },
  { id: "inverted", label: "Invertido", fg: "#ffffff", bg: "#111111" },
];

function resolveColor(value: string): string {
  if (typeof window === "undefined") return "#111111";
  if (!value.startsWith("var(")) return value;
  const name = value.replace("var(", "").replace(")", "").trim();
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return "#111111";
  return oklchToHex(raw) ?? raw;
}

function oklchToHex(input: string): string | null {
  if (!input.startsWith("oklch")) return null;
  try {
    const el = document.createElement("div");
    el.style.color = input;
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    document.body.appendChild(el);
    const rgb = getComputedStyle(el).color;
    document.body.removeChild(el);
    const match = rgb.match(/\d+/g);
    if (!match) return null;
    const [r, g, b] = match.map(Number);
    return `#${[r, g, b]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")}`;
  } catch {
    return null;
  }
}

export function QRShareCard() {
  const [url, setUrl] = useState("");
  const [palette, setPalette] = useState<Palette>("brand");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.origin);
    }
  }, []);

  const colors = useMemo(() => {
    const p = PALETTES.find((x) => x.id === palette) ?? PALETTES[0];
    return {
      fg: resolveColor(p.fg),
      bg: resolveColor(p.bg),
    };
  }, [palette]);

  useEffect(() => {
    if (!url) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(
      canvas,
      url,
      {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: colors.fg, light: colors.bg },
      },
      (err) => {
        if (err) return;
        setDataUrl(canvas.toDataURL("image/png"));
      },
    );
  }, [url, colors]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiada");
    } catch {
      toast.error("No pudimos copiar");
    }
  }

  async function downloadPng() {
    if (!url) return;
    try {
      const png = await QRCode.toDataURL(url, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: colors.fg, light: colors.bg },
      });
      triggerDownload(png, "catalogo-qr.png");
    } catch {
      toast.error("No pudimos generar el PNG");
    }
  }

  async function downloadSvg() {
    if (!url) return;
    try {
      const svg = await QRCode.toString(url, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: colors.fg, light: colors.bg },
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, "catalogo-qr.svg");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      toast.error("No pudimos generar el SVG");
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative overflow-hidden rounded-2xl border border-border/60 p-3 shadow-sm"
          style={{ background: colors.bg }}
        >
          <canvas
            ref={canvasRef}
            className="block h-48 w-48 sm:h-52 sm:w-52"
            aria-label="Vista previa del QR"
          />
          {!dataUrl && (
            <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
              Generando…
            </div>
          )}
        </div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Vista previa
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="qr-url"
            className="flex items-center justify-between"
          >
            <span>URL del catálogo</span>
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              <Copy className="h-3 w-3" aria-hidden />
              Copiar
            </button>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="qr-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-10 font-mono text-xs"
            />
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir catálogo en nueva pestaña"
                title="Abrir catálogo"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Puedes cambiarla si tu dominio final es distinto al actual.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="qr-palette">Estilo del QR</Label>
          <Select
            value={palette}
            onValueChange={(v) => setPalette(String(v) as Palette)}
          >
            <SelectTrigger id="qr-palette" className="w-full">
              <span className="inline-flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-primary" aria-hidden />
                <SelectValue placeholder="Elige un estilo" />
              </span>
            </SelectTrigger>
            <SelectContent>
              {PALETTES.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            type="button"
            onClick={downloadPng}
            className="gap-1.5 rounded-full"
          >
            <Download className="h-4 w-4" aria-hidden />
            PNG (1024px)
          </Button>
          <Button
            type="button"
            onClick={downloadSvg}
            variant="outline"
            className="gap-1.5 rounded-full"
          >
            <Download className="h-4 w-4" aria-hidden />
            SVG (vectorial)
          </Button>
        </div>

        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border border-primary/20 p-3 text-xs",
            "bg-primary/5 text-muted-foreground",
          )}
        >
          <QrCode
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">
              Cómo usarlo en TikTok
            </p>
            <p>
              Descarga el PNG en calidad alta y pégalo en la esquina de tus
              videos con la app de edición. Añade un texto tipo{" "}
              <span className="font-semibold text-foreground">
                “Escanea y pide”
              </span>{" "}
              o usa el SVG para carteles/pegatinas en tus repartos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
