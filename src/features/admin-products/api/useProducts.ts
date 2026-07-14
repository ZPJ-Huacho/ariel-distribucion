"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { Product, ProductInput } from "@/core/products";
import { productKeys } from "./keys";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  generateAIProductDescription,
  generateAIProductImage,
  generateStandaloneAIImage,
  updateProduct,
  uploadProductImage,
} from "./products.api";

export function useProducts(category?: string) {
  return useQuery<Product[], AppError>({
    queryKey: productKeys.list({ category }),
    queryFn: () => fetchProducts(category),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation<{ id: string }, AppError, ProductInput>({
    mutationFn: createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation<Product, AppError, { id: string; patch: Partial<ProductInput> }>({
    mutationFn: ({ id, patch }) => updateProduct(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  return useMutation<
    { key: string; url: string },
    AppError,
    { id: string; file: File }
  >({
    mutationFn: ({ id, file }) => uploadProductImage(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useGenerateAIImage() {
  const qc = useQueryClient();
  return useMutation<
    { url: string; key: string; used: number; limit: number },
    AppError,
    string
  >({
    mutationFn: (id) => generateAIProductImage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useGenerateStandaloneAIImage() {
  const qc = useQueryClient();
  return useMutation<
    { url: string; key: string; used: number; limit: number },
    AppError,
    string
  >({
    mutationFn: (productName) => generateStandaloneAIImage(productName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useGenerateAIDescription() {
  return useMutation<{ description: string }, AppError, string>({
    mutationFn: (productName) => generateAIProductDescription(productName),
  });
}
