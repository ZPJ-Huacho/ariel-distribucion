import { NextResponse } from "next/server";
import {
  DeleteProductUseCase,
  UpdateProductUseCase,
  getProductRepository,
  productInputSchema,
} from "@/core/products";
import { getStorageRepository } from "@/core/storage";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const input = await readJson(req, productInputSchema.partial());
    const session = await getSession();
    const useCase = new UpdateProductUseCase(getProductRepository());
    return NextResponse.json(await useCase.execute(session, id, input));
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const session = await getSession();
    const useCase = new DeleteProductUseCase(
      getProductRepository(),
      getStorageRepository(),
    );
    await useCase.execute(session, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
