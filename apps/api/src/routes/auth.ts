import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { nanoid } from "nanoid";
import { users } from "@mercabana/db";
import { createDb } from "@mercabana/db/client";
import { loginSchema, registerSchema } from "@mercabana/core";
import type { AuthUser } from "@mercabana/core";
import type { AppEnv } from "../env";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "../lib/session";

function toAuthUser(u: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "admin" | "customer";
}): AuthUser {
  return { id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role };
}

export const authRoutes = new Hono<AppEnv>()
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const input = c.req.valid("json");
    const tenant = c.get("tenant");
    const db = createDb(c.env.DB);
    const email = input.email.toLowerCase();

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.tenantId, tenant.id), eq(users.email, email)))
      .get();
    if (existing) return c.json({ error: "email_in_use" }, 409);

    const passwordHash = await hashPassword(input.password);
    const id = `usr_${nanoid(12)}`;
    await db.insert(users).values({
      id,
      tenantId: tenant.id,
      email,
      passwordHash,
      name: input.name,
      phone: input.phone,
      role: "customer",
    });

    const { token } = await createSession(c.env.SESSIONS, {
      userId: id,
      tenantId: tenant.id,
    });
    setCookie(c, SESSION_COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      maxAge: SESSION_TTL_SECONDS,
    });

    return c.json({
      user: toAuthUser({
        id,
        email,
        name: input.name,
        phone: input.phone,
        role: "customer",
      }),
    });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const input = c.req.valid("json");
    const tenant = c.get("tenant");
    const db = createDb(c.env.DB);
    const email = input.email.toLowerCase();

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenant.id), eq(users.email, email)))
      .get();
    if (!user) return c.json({ error: "invalid_credentials" }, 401);

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) return c.json({ error: "invalid_credentials" }, 401);

    const { token } = await createSession(c.env.SESSIONS, {
      userId: user.id,
      tenantId: tenant.id,
    });
    setCookie(c, SESSION_COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      maxAge: SESSION_TTL_SECONDS,
    });

    return c.json({ user: toAuthUser(user) });
  })
  .post("/logout", async (c) => {
    const token = c.get("sessionToken");
    if (token) await deleteSession(c.env.SESSIONS, token);
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.json({ ok: true });
  })
  .get("/me", (c) => {
    const user = c.get("user");
    return c.json({ user: user ? toAuthUser(user) : null });
  });
