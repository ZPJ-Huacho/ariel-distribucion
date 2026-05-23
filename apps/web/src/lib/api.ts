import { createApiClient, type ApiClient } from "@mercabana/core";

const DEFAULT_DEV_BASE = "http://localhost:8788";

/**
 * Browser client. Cookies are sent automatically by the browser when
 * `credentials: 'include'` is set (the client does this).
 */
export function createBrowserApiClient(): ApiClient {
  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_DEV_BASE,
  });
}
