import type { Session } from "@/core/shared";
import type { StorageRepository } from "@/core/storage";
import { ConflictError, UnauthorizedError, ForbiddenError, ValidationError } from "@/core/shared";
import type { Settings } from "../domain/models";
import type { SettingsRepository } from "../domain/repositories";

export class UploadLogoUseCase {
  constructor(
    private readonly repo: SettingsRepository,
    private readonly storage: StorageRepository,
  ) {}

  async execute(actor: Session, file: File): Promise<Settings> {
    if (!actor?.user) throw new UnauthorizedError();
    if (actor.user.role !== "admin") throw new ForbiddenError();

    const current = await this.repo.get();
    const uploaded = await this.storage.uploadImage(file, "logo");
    if (!uploaded.ok) {
      if (uploaded.error === "file_too_large")
        throw new ConflictError("file_too_large");
      throw new ValidationError({ file: uploaded.error });
    }

    const settings = await this.repo.update({
      logoKey: uploaded.key,
      logoUrl: uploaded.url,
    });

    if (current?.logoKey && current.logoKey !== uploaded.key) {
      await this.storage.delete(current.logoKey).catch(() => {});
    }

    return settings;
  }
}

export class RemoveLogoUseCase {
  constructor(
    private readonly repo: SettingsRepository,
    private readonly storage: StorageRepository,
  ) {}

  async execute(actor: Session): Promise<Settings> {
    if (!actor?.user) throw new UnauthorizedError();
    if (actor.user.role !== "admin") throw new ForbiddenError();

    const current = await this.repo.get();
    const settings = await this.repo.update({ logoKey: "", logoUrl: "" });
    if (current?.logoKey) {
      await this.storage.delete(current.logoKey).catch(() => {});
    }
    return settings;
  }
}
