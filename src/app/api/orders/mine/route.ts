import { NextResponse } from "next/server";
import { ListMyOrdersUseCase, getOrderRepository } from "@/core/orders";
import { getSession } from "@/core/auth";
import { jsonError } from "@/shared/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    const useCase = new ListMyOrdersUseCase(getOrderRepository());
    return NextResponse.json(await useCase.execute(session));
  } catch (err) {
    return jsonError(err);
  }
}
