import { NextResponse } from "next/server";
import {
  GenerateAIDescriptionUseCase,
  getProductRepository,
} from "@/core/products";
import { getSettingsRepository } from "@/core/settings";
import { getSession } from "@/core/auth";
import { jsonError } from "@/shared/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const session = await getSession();
    const useCase = new GenerateAIDescriptionUseCase(
      getProductRepository(),
      getSettingsRepository(),
    );
    return NextResponse.json(await useCase.execute(session, id));
  } catch (err) {
    return jsonError(err);
  }
}
