import { NextResponse } from "next/server";
import { z } from "zod";
import { getSettingsRepository } from "@/core/settings";
import { getSession } from "@/core/auth";
import { generateProductDescription } from "@/core/products/infrastructure/GeminiImageGenerator";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "@/core/shared";
import { jsonError, readJson } from "@/shared/lib/api-response";

const schema = z.object({
  productName: z.string().min(1, "El nombre es obligatorio"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) throw new UnauthorizedError();
    if (session.user.role !== "admin") throw new ForbiddenError();

    const { productName } = await readJson(req, schema);

    const settings = await getSettingsRepository().get();
    if (!settings?.aiEnabled) throw new ConflictError("ai_disabled");

    const description = await generateProductDescription({ productName });

    if (!description) throw new ConflictError("empty_description");

    return NextResponse.json({ description });
  } catch (err) {
    return jsonError(err);
  }
}
