import { createApiClient, type ApiClient } from "@mercabana/core";

const DEFAULT_DEV_BASE = "http://localhost:8788";
const DEFAULT_TENANT = "frutas";
const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app"]);

function tenantFromHost(): string {
  if (typeof window === "undefined") return DEFAULT_TENANT;
  const hostname = window.location.hostname.toLowerCase();
  if (!hostname || hostname === "localhost") return DEFAULT_TENANT;
  const parts = hostname.split(".");
  if (parts.length < 2) return DEFAULT_TENANT;
  const first = parts[0];
  if (!first || RESERVED_SUBDOMAINS.has(first)) return DEFAULT_TENANT;
  return first;
}

/**
 * Browser client. Cookies are sent automatically by the browser when
 * `credentials: 'include'` is set (the client does this).
 *
 * tenantSlug se deriva del subdominio actual del navegador
 * (frutas.localhost:3000 → "frutas"). Si no hay subdominio
 * reconocible cae a NEXT_PUBLIC_DEFAULT_TENANT o "frutas".
 */
export function createBrowserApiClient(): ApiClient {
  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_DEV_BASE,
    tenantSlug: process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? tenantFromHost(),
  });
}
