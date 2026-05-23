import { create } from "zustand";
import type { CategoryDef } from "@mercabana/core";
import { categories as seedCategories } from "./data/categories";

export type CategoryInput = Omit<CategoryDef, "sortOrder"> & {
  sortOrder?: number;
};

type CategoriesState = {
  categories: CategoryDef[];
  hydrated: boolean;
  setHydrated: (categories: CategoryDef[] | null) => void;
  addCategory: (input: CategoryInput) => CategoryDef;
  updateCategory: (slug: string, patch: Partial<CategoryDef>) => void;
  removeCategory: (slug: string) => void;
  resetToSeed: () => void;
};

function nextOrder(list: CategoryDef[]): number {
  return list.reduce((max, c) => (c.sortOrder > max ? c.sortOrder : max), 0) + 1;
}

function reindex(list: CategoryDef[]): CategoryDef[] {
  return [...list]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c, idx) => ({ ...c, sortOrder: idx + 1 }));
}

export const useCategories = create<CategoriesState>((set, get) => ({
  categories: seedCategories,
  hydrated: false,
  setHydrated: (categories) =>
    set({
      categories:
        categories && categories.length > 0 ? reindex(categories) : seedCategories,
      hydrated: true,
    }),
  addCategory: (input) => {
    const cat: CategoryDef = {
      slug: input.slug,
      title: input.title,
      lead: input.lead,
      icon: input.icon,
      sortOrder: input.sortOrder ?? nextOrder(get().categories),
    };
    set((state) => ({ categories: reindex([...state.categories, cat]) }));
    return cat;
  },
  updateCategory: (slug, patch) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.slug === slug ? { ...c, ...patch } : c,
      ),
    })),
  removeCategory: (slug) =>
    set((state) => ({
      categories: reindex(state.categories.filter((c) => c.slug !== slug)),
    })),
  resetToSeed: () => set({ categories: seedCategories }),
}));

export const CATEGORIES_STORAGE_KEY = "mercadigital:categories:v1";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 32);
}
