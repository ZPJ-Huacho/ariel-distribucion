import { NextResponse } from "next/server";
import {
  RegisterUserUseCase,
  getUserRepository,
  registerSchema,
} from "@/core/users";
import { jsonError, readJson } from "@/shared/lib/api-response";

export async function POST(req: Request) {
  try {
    const input = await readJson(req, registerSchema);
    const useCase = new RegisterUserUseCase(getUserRepository());
    return NextResponse.json({ user: await useCase.execute(input) });
  } catch (err) {
    return jsonError(err);
  }
}
