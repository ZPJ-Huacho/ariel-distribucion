import { NextResponse } from "next/server";
import {
  GetProfileUseCase,
  UpdateProfileUseCase,
  getUserRepository,
  updateProfileSchema,
} from "@/core/users";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

export async function GET() {
  const session = await getSession();
  const useCase = new GetProfileUseCase(getUserRepository());
  return NextResponse.json({ user: await useCase.execute(session) });
}

export async function PATCH(req: Request) {
  try {
    const input = await readJson(req, updateProfileSchema);
    const session = await getSession();
    const useCase = new UpdateProfileUseCase(getUserRepository());
    return NextResponse.json({ user: await useCase.execute(session, input) });
  } catch (err) {
    return jsonError(err);
  }
}
