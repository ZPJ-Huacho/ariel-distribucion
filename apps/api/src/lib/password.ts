import { hash, compare } from "bcrypt-ts";

const COST = 10;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, COST);
}

export function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed);
}
