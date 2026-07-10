import { NextResponse } from "next/server";
import {
  GenerateAIImageUseCase,
  getProductRepository,
} from "@/core/products";
import { getSettingsRepository } from "@/core/settings";
import { getStorageRepository } from "@/core/storage";
import { getSession } from "@/core/auth";
import { jsonError } from "@/shared/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const session = await getSession();
    const useCase = new GenerateAIImageUseCase(
      getProductRepository(),
      getSettingsRepository(),
      getStorageRepository(),
    );
    return NextResponse.json(await useCase.execute(session, id));
  } catch (err) {
    return jsonError(err);
  }
}
