import { NextResponse } from "next/server";
import {
  UpdateUserRoleUseCase,
  getUserRepository,
  updateUserRoleSchema,
} from "@/core/users";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { role } = await readJson(req, updateUserRoleSchema);
    const session = await getSession();
    const useCase = new UpdateUserRoleUseCase(getUserRepository());
    return NextResponse.json(await useCase.execute(session, id, role));
  } catch (err) {
    return jsonError(err);
  }
}
