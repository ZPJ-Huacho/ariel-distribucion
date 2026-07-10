import type { ThemeId } from "./themes";

/**
 * Diferenciación sutil del ProductCard por temática mediante ring/borde.
 * Nada de emojis en las cards — solo trabajo fino de color y grosor.
 * Los colores usan el token --primary del tema para mantener coherencia
 * automática con la paleta activa (light/dark).
 */
export type CardVariant = {
  ring?: string;
  priceColor?: string;
};

export function getCardVariant(themeId: ThemeId): CardVariant {
  switch (themeId) {
    case "halloween":
    case "sant-joan":
      return {
        ring: "ring-1 ring-[var(--theme-stripe)]/50 shadow-md shadow-[var(--primary)]/10",
      };
    case "navidad":
    case "sant-jordi":
    case "la-merce":
      return {
        ring: "ring-1 ring-[var(--theme-stripe)]/40",
      };
    case "san-valentin":
    case "carnaval":
      return {
        ring: "ring-1 ring-[var(--theme-stripe)]/35",
      };
    case "ano-nuevo":
    case "reyes":
    case "semana-santa":
      return {
        ring: "ring-1 ring-[var(--theme-stripe)]/25",
      };
    case "castanada":
    case "default":
    default:
      return {};
  }
}
