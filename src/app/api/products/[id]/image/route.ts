import { NextResponse } from "next/server";
import { UploadProductImageUseCase, getProductRepository } from "@/core/products";
import { getStorageRepository } from "@/core/storage";
import { getSession } from "@/core/auth";
import { jsonError } from "@/shared/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json({ error: "no_file" }, { status: 400 });

    const session = await getSession();
    const useCase = new UploadProductImageUseCase(
      getProductRepository(),
      getStorageRepository(),
    );
    return NextResponse.json(await useCase.execute(session, id, file));
  } catch (err) {
    return jsonError(err);
  }
}
