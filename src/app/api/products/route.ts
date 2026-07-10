import { NextResponse } from "next/server";
import {
  CreateProductUseCase,
  ListProductsUseCase,
  getProductRepository,
  productInputSchema,
} from "@/core/products";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") ?? undefined;
    const useCase = new ListProductsUseCase(getProductRepository());
    return NextResponse.json(await useCase.execute(category));
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const input = await readJson(req, productInputSchema);
    const session = await getSession();
    const useCase = new CreateProductUseCase(getProductRepository());
    return NextResponse.json(await useCase.execute(session, input));
  } catch (err) {
    return jsonError(err);
  }
}
