import type { CategoryDef } from "./types";

export const categories: CategoryDef[] = [
  {
    slug: "frutas",
    title: "Frutas de temporada",
    lead: "Recogidas en lonja a primera hora",
    icon: "🍎",
    sortOrder: 1,
  },
  {
    slug: "verduras",
    title: "Verduras frescas",
    lead: "Calidad Mercabarna, todos los días",
    icon: "🥬",
    sortOrder: 2,
  },
  {
    slug: "tropical",
    title: "Tropical",
    lead: "Producto maduro al punto",
    icon: "🥑",
    sortOrder: 3,
  },
];
