import { cookies as nextCookies } from "next/headers";
import { createApiClient, type ApiClient } from "@mercabana/core";

const DEFAULT_DEV_BASE = "http://localhost:8788";
const DEFAULT_TENANT = "frutas";

function baseUrl(): string {
  return process.env.API_BASE_URL ?? DEFAULT_DEV_BASE;
}

function tenantSlug(override?: string): string {
  return override ?? process.env.DEFAULT_TENANT_SLUG ?? DEFAULT_TENANT;
}

/**
 * Anonymous server-side client (no user cookie forwarded). Use for
 * public reads from RSC: home catalog, public tenant info.
 */
export function createServerApiClient(opts?: { tenantSlug?: string }): ApiClient {
  return createApiClient({
    baseUrl: baseUrl(),
    tenantSlug: tenantSlug(opts?.tenantSlug),
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
    tenantSlug: tenantSlug(opts?.tenantSlug),
    headers,
  });
}
