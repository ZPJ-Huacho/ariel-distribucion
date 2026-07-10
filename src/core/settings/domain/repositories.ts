import type { Settings, SettingsUpdate } from "./models";

export interface SettingsRepository {
  get(): Promise<Settings | null>;
  update(patch: SettingsUpdate): Promise<Settings>;
}
