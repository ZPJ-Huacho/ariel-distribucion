import type { UserRepository } from "../domain/repositories";
import { UserRepositoryDrizzle } from "./UserRepositoryDrizzle";

let cached: UserRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!cached) cached = new UserRepositoryDrizzle();
  return cached;
}
