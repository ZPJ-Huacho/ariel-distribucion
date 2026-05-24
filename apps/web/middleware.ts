import { NextResponse, type NextRequest } from "next/server";

const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app"]);

/**
 * Resuelve el tenant del subdominio (frutas.mercabana.com, frutas.localhost,
 * frutas.localhost:3000) y lo forwardea como header `x-tenant-slug` para que
 * RSC y `createRequestApiClient` lo lean sin volver a parsear el host.
 *
 * Si no hay subdominio reconocible (acceso a localhost:3000, mercabana.com
 * raw, IP, etc.), no añadimos header y el server-side helper cae al
 * DEFAULT_TENANT_SLUG (env) o al fallback "frutas".
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const slug = extractSubdomain(host);
  const headers = new Headers(request.headers);
  if (slug) {
    headers.set("x-tenant-slug", slug);
  } else {
    headers.delete("x-tenant-slug");
  }
  return NextResponse.next({ request: { headers } });
}

function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  if (!hostname || hostname === "localhost") return null;
  const parts = hostname.split(".");
  if (parts.length < 2) return null;
  const first = parts[0];
  if (!first || RESERVED_SUBDOMAINS.has(first)) return null;
  return first;
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - /_next/* (assets estáticos)
     * - /favicon.ico, /r2/* (archivos)
     */
    "/((?!_next/|favicon\\.ico|r2/).*)",
  ],
};
