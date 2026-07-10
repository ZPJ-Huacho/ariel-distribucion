import type { CategoryRepository } from "../domain/repositories";
import type { Category, CategoryInput } from "../domain/models";
import type { Session } from "@/core/shared";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/core/shared";

function requireAdmin(actor: Session): void {
  if (!actor?.user) throw new UnauthorizedError();
  if (actor.user.role !== "admin") throw new ForbiddenError();
}

export class ListCategoriesUseCase {
  constructor(private readonly repo: CategoryRepository) {}
  execute(): Promise<Category[]> {
    return this.repo.listActive();
  }
}

export class CreateCategoryUseCase {
  constructor(private readonly repo: CategoryRepository) {}
  async execute(actor: Session, input: CategoryInput): Promise<Category> {
    requireAdmin(actor);
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) throw new ConflictError("slug_in_use", "Ese slug ya existe");
    return this.repo.create(input);
  }
}

export class UpdateCategoryUseCase {
  constructor(private readonly repo: CategoryRepository) {}
  async execute(
    actor: Session,
    id: string,
    patch: Partial<CategoryInput>,
  ): Promise<Category> {
    requireAdmin(actor);
    const updated = await this.repo.update(id, patch);
    if (!updated) throw new NotFoundError("categoría");
    return updated;
  }
}

export class DeleteCategoryUseCase {
  constructor(private readonly repo: CategoryRepository) {}
  async execute(actor: Session, id: string): Promise<void> {
    requireAdmin(actor);
    if (await this.repo.hasProducts(id))
      throw new ConflictError("category_in_use", "La categoría tiene productos");
    const ok = await this.repo.remove(id);
    if (!ok) throw new NotFoundError("categoría");
  }
}
