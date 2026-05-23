import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import { users } from "@mercabana/db";
import { createDb } from "@mercabana/db/client";
import type { AppEnv } from "../env";
import { readSession, SESSION_COOKIE } from "../lib/session";

export const resolveSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE) ?? null;
  c.set("sessionToken", token);
  const session = await readSession(c.env.SESSIONS, token ?? undefined);
  if (!session) {
    c.set("user", null);
    return next();
  }
  const tenant = c.get("tenant");
  if (session.tenantId !== tenant.id) {
    c.set("user", null);
    return next();
  }
  const db = createDb(c.env.DB);
  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  c.set("user", user ?? null);
  await next();
};

export const requireUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "unauthorized" }, 401);
  await next();
};

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "unauthorized" }, 401);
  if (user.role !== "admin") return c.json({ error: "forbidden" }, 403);
  await next();
};
