import { cookies as nextCookies, headers as nextHeaders } from "next/headers";
import { createApiClient, type ApiClient, type Tenant } from "@mercabana/core";
import { tenant as fallbackTenant } from "@/lib/data/tenant";

const DEFAULT_DEV_BASE = "http://localhost:8788";
const DEFAULT_TENANT = "frutas";

function baseUrl(): string {
  return process.env.API_BASE_URL ?? DEFAULT_DEV_BASE;
}

async function resolveTenantSlug(override?: string): Promise<string> {
  if (override) return override;
  // El middleware setea x-tenant-slug a partir del subdominio.
  try {
    const h = await nextHeaders();
    const fromHeader = h.get("x-tenant-slug");
    if (fromHeader) return fromHeader;
  } catch {
    // Fuera de un request (build time) — sigue al fallback.
  }
  return process.env.DEFAULT_TENANT_SLUG ?? DEFAULT_TENANT;
}

/**
 * Anonymous server-side client (no user cookie forwarded). Use for
 * public reads from RSC: home catalog, public tenant info.
 */
export async function createServerApiClient(opts?: {
  tenantSlug?: string;
}): Promise<ApiClient> {
  return createApiClient({
    baseUrl: baseUrl(),
    tenantSlug: await resolveTenantSlug(opts?.tenantSlug),
  });
}

/**
 * Server-side client that forwards the current request cookies so the
 * Worker sees the user's session. Use from RSC for admin pages and any
 * endpoint that depends on auth.
 */
export async function createRequestApiClient(opts?: {
  tenantSlug?: string;
}): Promise<ApiClient> {
  const c = await nextCookies();
  const cookieHeader = c.toString();
  const headers: Record<string, string> = {};
  if (cookieHeader) headers.cookie = cookieHeader;
  return createApiClient({
    baseUrl: baseUrl(),
    tenantSlug: await resolveTenantSlug(opts?.tenantSlug),
    headers,
  });
}

/**
 * Fetch the current request's tenant from the API. Returns the local
 * fallback (frutas hardcoded) if the API is unreachable, so the layout
 * never errors out.
 */
export async function getCurrentTenant(): Promise<Tenant> {
  try {
    const client = await createServerApiClient();
    return await client.tenant.get();
  } catch {
    return fallbackTenant;
  }
}
