import type { Settings } from "@/core/settings";
import { getActiveTheme } from "./themes";

export function themeStyleSheet(settings: Settings): string {
  const theme = getActiveTheme(settings.theme);
  const primary = theme.primaryColor;
  const fg = pickForeground(primary);
  const isDefault = theme.id === "default";
  const isDark = theme.mode === "dark";

  // Tintes y acentos usados en fondos, franjas y bordes decorativos.
  const tint = isDefault
    ? "var(--background)"
    : isDark
      ? `color-mix(in oklch, ${primary} 12%, oklch(0.13 0.005 250))`
      : `color-mix(in oklch, ${primary} 5%, var(--background))`;
  const accent = isDefault
    ? "var(--background)"
    : `color-mix(in oklch, ${primary} 14%, var(--background))`;
  const stripe = isDefault
    ? "var(--border)"
    : `color-mix(in oklch, ${primary} 55%, ${isDark ? "black" : "var(--background)"})`;

  const base = [
    `--primary:${primary};`,
    `--primary-foreground:${fg};`,
    `--theme-tint:${tint};`,
    `--theme-accent:${accent};`,
    `--theme-stripe:${stripe};`,
  ];

  // Paleta dark tintada con el color del tema. Cada festividad tiene su propio
  // negro (naranja oscuro Halloween, rojo profundo La Mercè, etc.) en vez del
  // gris azulado genérico del .dark base.
  const dark = isDark
    ? [
        `--background:color-mix(in oklch, ${primary} 5%, oklch(0.12 0.008 250));`,
        `--foreground:oklch(0.97 0.005 250);`,
        `--card:color-mix(in oklch, ${primary} 6%, oklch(0.18 0.008 250));`,
        `--card-foreground:oklch(0.97 0.005 250);`,
        `--popover:color-mix(in oklch, ${primary} 8%, oklch(0.20 0.008 250));`,
        `--popover-foreground:oklch(0.97 0.005 250);`,
        `--surface-1:color-mix(in oklch, ${primary} 4%, oklch(0.13 0.008 250));`,
        `--surface-2:color-mix(in oklch, ${primary} 6%, oklch(0.18 0.008 250));`,
        `--surface-3:color-mix(in oklch, ${primary} 8%, oklch(0.22 0.008 250));`,
        `--muted:color-mix(in oklch, ${primary} 4%, oklch(0.22 0.008 250));`,
        `--muted-foreground:oklch(0.72 0.01 250);`,
        `--secondary:color-mix(in oklch, ${primary} 5%, oklch(0.22 0.008 250));`,
        `--secondary-foreground:oklch(0.96 0.005 250);`,
        `--accent:color-mix(in oklch, ${primary} 20%, oklch(0.25 0.02 250));`,
        `--accent-foreground:oklch(0.97 0.005 250);`,
        `--border:color-mix(in oklch, ${primary} 22%, oklch(0.25 0.008 250 / 40%));`,
        `--border-subtle:color-mix(in oklch, ${primary} 12%, oklch(1 0 0 / 6%));`,
        `--border-strong:color-mix(in oklch, ${primary} 30%, oklch(1 0 0 / 14%));`,
        `--input:color-mix(in oklch, ${primary} 10%, oklch(0.24 0.008 250));`,
        `--ring:color-mix(in oklch, ${primary} 40%, oklch(0.55 0.02 250));`,
      ]
    : [];

  return `:root{${[...base, ...dark].join("")}}`;
}

function pickForeground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 0.55 ? "#111111" : "#ffffff";
}
