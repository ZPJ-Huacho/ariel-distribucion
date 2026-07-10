import type { SettingsRepository } from "../domain/repositories";
import { SettingsRepositoryDrizzle } from "./SettingsRepositoryDrizzle";

let cached: SettingsRepository | null = null;

export function getSettingsRepository(): SettingsRepository {
  if (!cached) cached = new SettingsRepositoryDrizzle();
  return cached;
}
