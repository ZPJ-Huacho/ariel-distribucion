import { NextResponse } from "next/server";
import {
  DeleteCategoryUseCase,
  UpdateCategoryUseCase,
  categoryInputSchema,
  getCategoryRepository,
} from "@/core/categories";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const patch = await readJson(req, categoryInputSchema.partial());
    const session = await getSession();
    const useCase = new UpdateCategoryUseCase(getCategoryRepository());
    return NextResponse.json(await useCase.execute(session, id, patch));
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const session = await getSession();
    const useCase = new DeleteCategoryUseCase(getCategoryRepository());
    await useCase.execute(session, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
