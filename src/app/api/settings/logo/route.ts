import { NextResponse } from "next/server";
import {
  RemoveLogoUseCase,
  UploadLogoUseCase,
  getSettingsRepository,
} from "@/core/settings";
import { getStorageRepository } from "@/core/storage";
import { getSession } from "@/core/auth";
import { jsonError } from "@/shared/lib/api-response";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json({ error: "no_file" }, { status: 400 });

    const session = await getSession();
    const useCase = new UploadLogoUseCase(
      getSettingsRepository(),
      getStorageRepository(),
    );
    return NextResponse.json(await useCase.execute(session, file));
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    const useCase = new RemoveLogoUseCase(
      getSettingsRepository(),
      getStorageRepository(),
    );
    return NextResponse.json(await useCase.execute(session));
  } catch (err) {
    return jsonError(err);
  }
}
