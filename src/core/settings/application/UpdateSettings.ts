import type { SettingsRepository } from "../domain/repositories";
import type { Settings, SettingsUpdate } from "../domain/models";
import type { Session } from "@/core/shared";
import { ForbiddenError, UnauthorizedError, isAdmin } from "@/core/shared";

export class UpdateSettingsUseCase {
  constructor(private readonly repo: SettingsRepository) {}

  async execute(actor: Session, patch: SettingsUpdate): Promise<Settings> {
    if (!actor?.user) throw new UnauthorizedError();
    if (!isAdmin(actor.user.role)) throw new ForbiddenError();
    return this.repo.update(patch);
  }
}
