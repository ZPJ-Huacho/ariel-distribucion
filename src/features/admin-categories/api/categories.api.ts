import { publicApi, privateApi } from "@/shared/infrastructure/http";
import type { Category, CategoryInput } from "@/core/categories";

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await publicApi.get<Category[]>("/api/categories");
  return data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await privateApi.post<Category>("/api/categories", input);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await privateApi.delete(`/api/categories/${id}`);
}
