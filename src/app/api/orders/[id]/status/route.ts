import { NextResponse } from "next/server";
import { z } from "zod";
import {
  UpdateOrderStatusUseCase,
  getOrderRepository,
  orderStatusSchema,
} from "@/core/orders";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({ status: orderStatusSchema });

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { status } = await readJson(req, bodySchema);
    const session = await getSession();
    const useCase = new UpdateOrderStatusUseCase(getOrderRepository());
    return NextResponse.json(await useCase.execute(session, id, status));
  } catch (err) {
    return jsonError(err);
  }
}
