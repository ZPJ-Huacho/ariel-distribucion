import type { CategoryDef, Product, Tenant } from "./types";

export type WireOrderItem = {
  name: string;
  quantity: number;
  unit: string;
  price: number;
};

export type ApiClientOptions = {
  baseUrl: string;
  tenantSlug?: string;
  fetch?: typeof fetch;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `API error ${status}`);
  }
}

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  preferredTime?: string;
  notes?: string;
  source?: string;
  items: WireOrderItem[];
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export function createApiClient(opts: ApiClientOptions) {
  const fetchImpl = opts.fetch ?? fetch;

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(opts.headers);
    if (opts.tenantSlug) headers.set("x-tenant-slug", opts.tenantSlug);
    if (init.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    const res = await fetchImpl(`${opts.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
    } as RequestInit);
    const text = await res.text();
    const body = text ? (safeJson(text) ?? text) : null;
    if (!res.ok) throw new ApiError(res.status, body);
    return body as T;
  }

  return {
    tenant: {
      get: () => request<Tenant>("/api/tenant"),
    },
    categories: {
      list: () => request<CategoryDef[]>("/api/categories"),
    },
    products: {
      list: (params?: { category?: string }) => {
        const qs = params?.category ? `?category=${encodeURIComponent(params.category)}` : "";
        return request<Product[]>(`/api/products${qs}`);
      },
    },
    orders: {
      create: (input: CreateOrderInput) =>
        request<{ id: string; code: string }>("/api/orders", {
          method: "POST",
          body: JSON.stringify(input),
        }),
    },
    auth: {
      login: (input: LoginInput) =>
        request<{ user: AuthUser }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(input),
        }),
      register: (input: RegisterInput) =>
        request<{ user: AuthUser }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(input),
        }),
      logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
      me: () => request<{ user: AuthUser | null }>("/api/auth/me"),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "admin" | "customer";
};

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
