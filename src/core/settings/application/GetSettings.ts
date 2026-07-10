import type { SettingsRepository } from "../domain/repositories";
import { FALLBACK_SETTINGS, type Settings } from "../domain/models";

export class GetSettingsUseCase {
  constructor(private readonly repo: SettingsRepository) {}

  async execute(): Promise<Settings> {
    try {
      const s = await this.repo.get();
      return s ?? FALLBACK_SETTINGS;
    } catch {
      return FALLBACK_SETTINGS;
    }
  }
}
