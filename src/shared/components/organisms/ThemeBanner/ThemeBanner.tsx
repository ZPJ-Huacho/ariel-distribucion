"use client";

import { useSettings } from "@/shared/providers/SettingsProvider";
import { getActiveTheme } from "@/shared/lib/themes";

/**
 * Chip mínimo que anuncia la temática activa. No es una card ni un banner
 * grande — sólo una pequeña pista visual arriba del hero del catálogo.
 */
export function ThemeBanner() {
  const s = useSettings();
  const theme = getActiveTheme(s.theme);
  if (theme.id === "default") return null;

  return (
    <div
      className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
      style={{
        borderColor: "var(--theme-stripe)",
        color: "var(--foreground)",
        background: "var(--theme-accent)",
      }}
    >
      <span aria-hidden className="text-sm leading-none">{theme.emoji}</span>
      <span className="font-medium">{theme.label}</span>
    </div>
  );
}
