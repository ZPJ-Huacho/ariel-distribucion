import { NextResponse } from "next/server";
import {
  CreateOrderUseCase,
  ListOrdersUseCase,
  createOrderSchema,
  getOrderRepository,
} from "@/core/orders";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    const useCase = new ListOrdersUseCase(getOrderRepository());
    return NextResponse.json(await useCase.execute(session));
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const input = await readJson(req, createOrderSchema);
    const session = await getSession();
    const useCase = new CreateOrderUseCase(getOrderRepository());
    return NextResponse.json(await useCase.execute(session, input));
  } catch (err) {
    return jsonError(err);
  }
}
