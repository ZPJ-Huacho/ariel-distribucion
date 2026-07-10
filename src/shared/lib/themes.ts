export type ThemeId =
  | "default"
  | "navidad"
  | "ano-nuevo"
  | "reyes"
  | "san-valentin"
  | "carnaval"
  | "sant-jordi"
  | "semana-santa"
  | "sant-joan"
  | "la-merce"
  | "castanada"
  | "halloween";

export type ThemeMode = "light" | "dark";
export type ThemeVibe =
  | "clean"
  | "festive"
  | "romantic"
  | "spooky"
  | "elegant"
  | "bold";

export type Theme = {
  id: ThemeId;
  label: string;
  description: string;
  primaryColor: string;
  emoji: string;
  mode: ThemeMode;
  vibe: ThemeVibe;
};

export const THEMES: Record<ThemeId, Theme> = {
  default: {
    id: "default",
    label: "Sin temática",
    description: "Look base verde del negocio.",
    primaryColor: "#2d5128",
    emoji: "🍊",
    mode: "light",
    vibe: "clean",
  },
  navidad: {
    id: "navidad",
    label: "Navidad",
    description: "Rojo profundo cálido para diciembre.",
    primaryColor: "#c1272d",
    emoji: "🎄",
    mode: "light",
    vibe: "festive",
  },
  "ano-nuevo": {
    id: "ano-nuevo",
    label: "Año Nuevo",
    description: "Dorado elegante sobre fondo oscuro.",
    primaryColor: "#e8b93a",
    emoji: "🥂",
    mode: "dark",
    vibe: "elegant",
  },
  reyes: {
    id: "reyes",
    label: "Reyes Magos",
    description: "Púrpura noble y sereno para el 6 de enero.",
    primaryColor: "#7c3aed",
    emoji: "👑",
    mode: "light",
    vibe: "elegant",
  },
  "san-valentin": {
    id: "san-valentin",
    label: "San Valentín",
    description: "Rosa cálido para el 14 de febrero.",
    primaryColor: "#e91e63",
    emoji: "💕",
    mode: "light",
    vibe: "romantic",
  },
  carnaval: {
    id: "carnaval",
    label: "Carnaval",
    description: "Púrpura vibrante para las fiestas de febrero.",
    primaryColor: "#8e24aa",
    emoji: "🎭",
    mode: "light",
    vibe: "festive",
  },
  "sant-jordi": {
    id: "sant-jordi",
    label: "Sant Jordi",
    description: "Rojo catalán para el 23 de abril.",
    primaryColor: "#d1191f",
    emoji: "🌹",
    mode: "light",
    vibe: "romantic",
  },
  "semana-santa": {
    id: "semana-santa",
    label: "Semana Santa",
    description: "Morado sobrio para la Semana Santa.",
    primaryColor: "#4527a0",
    emoji: "🕊️",
    mode: "light",
    vibe: "elegant",
  },
  "sant-joan": {
    id: "sant-joan",
    label: "Sant Joan",
    description: "Naranja cálido para la noche del 23 de junio.",
    primaryColor: "#ff6b1a",
    emoji: "🔥",
    mode: "dark",
    vibe: "bold",
  },
  "la-merce": {
    id: "la-merce",
    label: "La Mercè",
    description: "Rojo Barcelona sobre noche festiva.",
    primaryColor: "#e53935",
    emoji: "🎆",
    mode: "dark",
    vibe: "festive",
  },
  castanada: {
    id: "castanada",
    label: "Castañada",
    description: "Marrón castaña cálido para el 31 de octubre.",
    primaryColor: "#8b5e3c",
    emoji: "🌰",
    mode: "light",
    vibe: "clean",
  },
  halloween: {
    id: "halloween",
    label: "Halloween",
    description: "Naranja intenso sobre noche oscura.",
    primaryColor: "#ff7518",
    emoji: "🎃",
    mode: "dark",
    vibe: "spooky",
  },
};

import { FEATURES } from "./feature-flags";

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export function getTheme(id: ThemeId | string | null | undefined): Theme {
  if (!id) return THEMES.default;
  return THEMES[id as ThemeId] ?? THEMES.default;
}

/**
 * Igual que `getTheme` pero respeta el feature flag `FEATURES.themes`.
 * Si el sistema de temáticas está apagado, devuelve siempre el tema base.
 * Úsalo en toda la UI que dependa del tema activo.
 */
export function getActiveTheme(
  id: ThemeId | string | null | undefined,
): Theme {
  if (!FEATURES.themes) return THEMES.default;
  return getTheme(id);
}
