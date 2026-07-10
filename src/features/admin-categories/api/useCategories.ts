"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { Category, CategoryInput } from "@/core/categories";
import { categoryKeys } from "./keys";
import { createCategory, deleteCategory, fetchCategories } from "./categories.api";

export function useCategories() {
  return useQuery<Category[], AppError>({
    queryKey: categoryKeys.list(),
    queryFn: fetchCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation<Category, AppError, CategoryInput>({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
