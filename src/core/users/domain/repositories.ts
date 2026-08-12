import type { Role } from "@/core/shared";
import type { User, UserWithPassword } from "./models";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<UserWithPassword | null>;
  listAll(): Promise<User[]>;
  create(input: {
    email: string;
    passwordHash: string;
    name: string;
    phone: string | null;
  }): Promise<User>;
  updateProfile(
    id: string,
    patch: {
      name?: string;
      phone?: string;
      address?: string;
      preferredDeliveryTime?: string;
      passwordHash?: string;
    },
  ): Promise<User | null>;
  updateRole(id: string, role: Role): Promise<User | null>;
  getPasswordHash(id: string): Promise<string | null>;
}
