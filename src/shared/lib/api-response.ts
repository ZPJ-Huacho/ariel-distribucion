import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { DomainError } from "@/core/shared";

const STATUS_BY_KIND: Record<string, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  bad_request: 400,
  file_too_large: 413,
  invalid_type: 415,
  email_in_use: 409,
  slug_in_use: 409,
  category_in_use: 409,
  invalid_current_password: 401,
};

function statusForCode(code: string): number {
  return STATUS_BY_KIND[code] ?? 409;
}

export function jsonError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "bad_request", details: z.treeifyError(err) },
      { status: 400 },
    );
  }
  if (err instanceof DomainError) {
    const status = statusForCode(err.code);
    const body: Record<string, unknown> = { error: err.code, message: err.message };
    if ("details" in err) body.details = (err as { details?: unknown }).details;
    return NextResponse.json(body, { status });
  }
  console.error("[api] unexpected error:", err);
  return NextResponse.json({ error: "server_error" }, { status: 500 });
}

export async function readJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}
