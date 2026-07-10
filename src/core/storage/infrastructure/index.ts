import type { StorageRepository } from "../domain/repositories";
import { R2Storage } from "./R2Storage";

let cached: StorageRepository | null = null;

export function getStorageRepository(): StorageRepository {
  if (!cached) cached = new R2Storage();
  return cached;
}
