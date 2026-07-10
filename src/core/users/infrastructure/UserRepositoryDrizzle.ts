import { eq } from "drizzle-orm";
import { getDb, users } from "@/shared/lib/db";
import type { UserRepository } from "../domain/repositories";
import type { User, UserWithPassword } from "../domain/models";

const userColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  phone: users.phone,
  address: users.address,
  preferredDeliveryTime: users.preferredDeliveryTime,
  role: users.role,
  createdAt: users.createdAt,
} as const;

type UserRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  preferredDeliveryTime: string | null;
  role: "admin" | "customer";
  createdAt: Date;
};

function toDomain(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    address: row.address,
    preferredDeliveryTime: row.preferredDeliveryTime,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

export class UserRepositoryDrizzle implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const db = getDb();
    const rows = await db
      .select(userColumns)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...toDomain(r),
      passwordHash: r.passwordHash,
    };
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    phone: string | null;
  }): Promise<User> {
    const db = getDb();
    const [row] = await db
      .insert(users)
      .values({ ...input, role: "customer" })
      .returning(userColumns);
    return toDomain(row);
  }

  async updateProfile(
    id: string,
    patch: {
      name?: string;
      phone?: string;
      address?: string;
      preferredDeliveryTime?: string;
      passwordHash?: string;
    },
  ): Promise<User | null> {
    const db = getDb();
    if (!Object.keys(patch).length) return this.findById(id);
    const rows = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, id))
      .returning(userColumns);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async getPasswordHash(id: string): Promise<string | null> {
    const db = getDb();
    const rows = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows[0]?.passwordHash ?? null;
  }
}
