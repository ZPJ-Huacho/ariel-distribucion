import { eq } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import { tenants } from "@mercabana/db";
import { createDb } from "@mercabana/db/client";
import type { AppEnv } from "../env";

export const resolveTenant: MiddlewareHandler<AppEnv> = async (c, next) => {
  const explicit = c.req.header("x-tenant-slug")?.trim().toLowerCase();
  const slug = explicit || extractSubdomain(c.req.header("host") ?? "");
  if (!slug) {
    return c.json({ error: "tenant_not_specified" }, 400);
  }
  const db = createDb(c.env.DB);
  const tenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).get();
  if (!tenant) {
    return c.json({ error: "tenant_not_found", slug }, 404);
  }
  c.set("tenant", tenant);
  await next();
};

function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  const parts = hostname.split(".");
  if (parts.length < 2) return null;
  const first = parts[0];
  if (first === "www" || first === "api") return null;
  return first;
}
