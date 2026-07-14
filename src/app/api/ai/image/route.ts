import { NextResponse } from "next/server";
import { z } from "zod";
import { GenerateAIImageStandaloneUseCase } from "@/core/products";
import { getSettingsRepository } from "@/core/settings";
import { getStorageRepository } from "@/core/storage";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

const schema = z.object({
  productName: z.string().min(1, "El nombre es obligatorio"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { productName } = await readJson(req, schema);
    const useCase = new GenerateAIImageStandaloneUseCase(
      getSettingsRepository(),
      getStorageRepository(),
    );
    return NextResponse.json(await useCase.execute(session, productName));
  } catch (err) {
    return jsonError(err);
  }
}
