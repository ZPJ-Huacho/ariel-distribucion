import type { ProductRepository } from "../domain/repositories";
import type { Product, ProductInput } from "../domain/models";
import type { StorageRepository } from "@/core/storage";
import { getCategoryRepository } from "@/core/categories";
import { getStorageRepository } from "@/core/storage";
import { getProductRepository } from "../infrastructure";
import type { Session } from "@/core/shared";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/core/shared";

function requireAdmin(actor: Session): void {
  if (!actor?.user) throw new UnauthorizedError();
  if (actor.user.role !== "admin") throw new ForbiddenError();
}

async function resolveCategoryId(categorySlug: string): Promise<string> {
  const repo = getCategoryRepository();
  const cat = await repo.findBySlug(categorySlug);
  if (!cat) throw new ValidationError({ category: "invalid_category" });
  return cat.id;
}

export class ListProductsUseCase {
  constructor(private readonly repo: ProductRepository) {}

  async execute(categorySlug?: string): Promise<Product[]> {
    const storage = getStorageRepository();
    const rows = await this.repo.list(categorySlug);
    return rows.map((p) => ({ ...p, imageUrl: storage.publicUrl(p.imageKey) }));
  }
}

export class CreateProductUseCase {
  constructor(private readonly repo: ProductRepository) {}

  async execute(actor: Session, input: ProductInput): Promise<Product> {
    requireAdmin(actor);
    const categoryId = await resolveCategoryId(input.category);
    return this.repo.create(categoryId, input);
  }
}

export class UpdateProductUseCase {
  constructor(private readonly repo: ProductRepository) {}

  async execute(
    actor: Session,
    id: string,
    input: Partial<ProductInput>,
  ): Promise<Product> {
    requireAdmin(actor);
    const patch: Partial<Omit<ProductInput, "category">> & { categoryId?: string } =
      { ...input };
    if (input.category !== undefined) {
      patch.categoryId = await resolveCategoryId(input.category);
      delete (patch as { category?: unknown }).category;
    }
    const updated = await this.repo.update(id, patch);
    if (!updated) throw new NotFoundError("producto");
    return updated;
  }
}

export class DeleteProductUseCase {
  constructor(
    private readonly repo: ProductRepository,
    private readonly storage: StorageRepository,
  ) {}

  async execute(actor: Session, id: string): Promise<void> {
    requireAdmin(actor);
    const { removed, imageKey } = await this.repo.remove(id);
    if (!removed) throw new NotFoundError("producto");
    if (imageKey && !imageKey.startsWith("http") && !imageKey.startsWith("data:")) {
      try {
        await this.storage.delete(imageKey);
      } catch {
        // best-effort: no bloqueamos la respuesta si el objeto huérfano falla.
      }
    }
  }
}

export class UploadProductImageUseCase {
  constructor(
    private readonly repo: ProductRepository,
    private readonly storage: StorageRepository,
  ) {}

  async execute(
    actor: Session,
    id: string,
    file: File,
  ): Promise<{ key: string; url: string }> {
    requireAdmin(actor);
    const uploaded = await this.storage.uploadImage(file, "products");
    if (!uploaded.ok) {
      if (uploaded.error === "file_too_large")
        throw new ConflictError("file_too_large");
      throw new ValidationError({ file: uploaded.error });
    }
    const previous = await this.repo.setImageKey(id, uploaded.key);
    if (previous === null) {
      // el producto no existía: rollback del upload
      await this.storage.delete(uploaded.key).catch(() => {});
      throw new NotFoundError("producto");
    }
    if (previous && !previous.startsWith("http") && !previous.startsWith("data:")) {
      await this.storage.delete(previous).catch(() => {});
    }
    return { key: uploaded.key, url: uploaded.url };
  }
}

export function listProductsUseCase() {
  return new ListProductsUseCase(getProductRepository());
}

export { GenerateAIImageUseCase } from "./GenerateAIImage";
export { GenerateAIImageStandaloneUseCase } from "./GenerateAIImageStandalone";
export { GenerateAIDescriptionUseCase } from "./GenerateAIDescription";
