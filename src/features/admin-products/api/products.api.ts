import { publicApi, privateApi } from "@/shared/infrastructure/http";
import type { Product, ProductInput } from "@/core/products";

export async function fetchProducts(category?: string): Promise<Product[]> {
  const params = category ? { category } : undefined;
  const { data } = await publicApi.get<Product[]>("/api/products", { params });
  return data;
}

export async function createProduct(input: ProductInput): Promise<{ id: string }> {
  const { data } = await privateApi.post<{ id: string }>("/api/products", input);
  return data;
}

export async function updateProduct(
  id: string,
  patch: Partial<ProductInput>,
): Promise<Product> {
  const { data } = await privateApi.patch<Product>(`/api/products/${id}`, patch);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await privateApi.delete(`/api/products/${id}`);
}

export async function generateAIProductImage(id: string): Promise<{
  url: string;
  key: string;
  used: number;
  limit: number;
}> {
  const { data } = await privateApi.post<{
    url: string;
    key: string;
    used: number;
    limit: number;
  }>(`/api/products/${id}/ai-image`);
  return data;
}

export async function generateStandaloneAIImage(
  productName: string,
): Promise<{ url: string; key: string; used: number; limit: number }> {
  const { data } = await privateApi.post<{
    url: string;
    key: string;
    used: number;
    limit: number;
  }>(`/api/ai/image`, { productName });
  return data;
}

export async function generateAIProductDescription(
  productName: string,
): Promise<{ description: string }> {
  const { data } = await privateApi.post<{ description: string }>(
    `/api/ai/description`,
    { productName },
  );
  return data;
}

export async function uploadProductImage(
  id: string,
  file: File,
): Promise<{ key: string; url: string }> {
  const form = new FormData();
  form.set("file", file);
  const { data } = await privateApi.post<{ key: string; url: string }>(
    `/api/products/${id}/image`,
    form,
  );
  return data;
}
