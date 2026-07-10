import { auth } from "../infrastructure/authjs";
import type { Session } from "@/core/shared";
import { ForbiddenError, UnauthorizedError } from "@/core/shared";

export async function getSession(): Promise<Session> {
  const s = await auth();
  if (!s?.user) return null;
  return {
    user: {
      id: s.user.id,
      email: s.user.email,
      name: s.user.name,
      role: s.user.role,
    },
  };
}

export async function requireSession(): Promise<NonNullable<Session>> {
  const s = await getSession();
  if (!s) throw new UnauthorizedError();
  return s;
}

export async function requireAdmin(): Promise<NonNullable<Session>> {
  const s = await requireSession();
  if (s.user.role !== "admin") throw new ForbiddenError();
  return s;
}
