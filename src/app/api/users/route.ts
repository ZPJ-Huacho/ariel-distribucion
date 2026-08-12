import { NextResponse } from "next/server";
import { ListUsersUseCase, getUserRepository } from "@/core/users";
import { getSession } from "@/core/auth";
import { jsonError } from "@/shared/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    const useCase = new ListUsersUseCase(getUserRepository());
    return NextResponse.json(await useCase.execute(session));
  } catch (err) {
    return jsonError(err);
  }
}
