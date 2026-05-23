import { createApiClient, type ApiClient } from "@mercabana/core";

const DEFAULT_DEV_BASE = "http://localhost:8788";
const DEFAULT_TENANT = "frutas";

export function createServerApiClient(opts?: {
  tenantSlug?: string;
  cookies?: string;
}): ApiClient {
  const headers: HeadersInit = {};
  if (opts?.cookies) headers.cookie = opts.cookies;
  return createApiClient({
    baseUrl: process.env.API_BASE_URL ?? DEFAULT_DEV_BASE,
    tenantSlug: opts?.tenantSlug ?? process.env.DEFAULT_TENANT_SLUG ?? DEFAULT_TENANT,
    headers,
  });
}

export function createBrowserApiClient(): ApiClient {
  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_DEV_BASE,
  });
}
