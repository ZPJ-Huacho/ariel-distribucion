import { NextResponse } from "next/server";
import {
  GetSettingsUseCase,
  UpdateSettingsUseCase,
  getSettingsRepository,
  settingsUpdateSchema,
} from "@/core/settings";
import { getSession } from "@/core/auth";
import { jsonError, readJson } from "@/shared/lib/api-response";

export async function GET() {
  const useCase = new GetSettingsUseCase(getSettingsRepository());
  return NextResponse.json(await useCase.execute());
}

export async function PATCH(req: Request) {
  try {
    const patch = await readJson(req, settingsUpdateSchema);
    const session = await getSession();
    const useCase = new UpdateSettingsUseCase(getSettingsRepository());
    return NextResponse.json(await useCase.execute(session, patch));
  } catch (err) {
    return jsonError(err);
  }
}
