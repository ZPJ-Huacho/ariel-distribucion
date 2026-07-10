import type { SettingsRepository } from "../domain/repositories";
import type { Settings, SettingsUpdate } from "../domain/models";
import type { Session } from "@/core/shared";
import { ForbiddenError, UnauthorizedError } from "@/core/shared";

export class UpdateSettingsUseCase {
  constructor(private readonly repo: SettingsRepository) {}

  async execute(actor: Session, patch: SettingsUpdate): Promise<Settings> {
    if (!actor?.user) throw new UnauthorizedError();
    if (actor.user.role !== "admin") throw new ForbiddenError();
    return this.repo.update(patch);
  }
}
