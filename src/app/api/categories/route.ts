import { NextResponse } from "next/server";
import {
  CreateCategoryUseCase,
  ListCategoriesUseCase,
  categoryInputSchema,
  getCategoryRepository,
} from "@/core/categories";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

export async function GET() {
  const useCase = new ListCategoriesUseCase(getCategoryRepository());
  return NextResponse.json(await useCase.execute());
}

export async function POST(req: Request) {
  try {
    const input = await readJson(req, categoryInputSchema);
    const session = await getSession();
    const useCase = new CreateCategoryUseCase(getCategoryRepository());
    return NextResponse.json(await useCase.execute(session, input));
  } catch (err) {
    return jsonError(err);
  }
}
