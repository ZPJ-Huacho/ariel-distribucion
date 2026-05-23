import { create } from "zustand";
import type { Product } from "@mercabana/core";
import { products as seedProducts } from "./data/products";

export type ProductInput = Omit<Product, "id" | "sortOrder"> & {
  sortOrder?: number;
};

type ProductsState = {
  products: Product[];
  hydrated: boolean;
  setHydrated: (products: Product[] | null) => void;
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  migrateCategory: (from: string, to: string) => void;
  removeByCategory: (slug: string) => void;
  resetToSeed: () => void;
};

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `prod-${Math.random().toString(36).slice(2, 10)}`;
}

export const useProducts = create<ProductsState>((set, get) => ({
  products: seedProducts,
  hydrated: false,
  setHydrated: (products) =>
    set({
      products: products && products.length > 0 ? products : seedProducts,
      hydrated: true,
    }),
  addProduct: (input) => {
    const maxOrder = get().products.reduce(
      (max, p) => (p.sortOrder > max ? p.sortOrder : max),
      0,
    );
    const product: Product = {
      ...input,
      id: generateId(),
      sortOrder: input.sortOrder ?? maxOrder + 1,
    };
    set((state) => ({ products: [...state.products, product] }));
    return product;
  },
  updateProduct: (id, patch) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  removeProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
  migrateCategory: (from, to) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.category === from ? { ...p, category: to } : p,
      ),
    })),
  removeByCategory: (slug) =>
    set((state) => ({
      products: state.products.filter((p) => p.category !== slug),
    })),
  resetToSeed: () => set({ products: seedProducts }),
}));

export const PRODUCTS_STORAGE_KEY = "mercadigital:products:v1";

export function productsByCategory(products: Product[]): Record<string, Product[]> {
  const grouped: Record<string, Product[]> = {};
  for (const p of [...products].sort((a, b) => a.sortOrder - b.sortOrder)) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }
  return grouped;
}
