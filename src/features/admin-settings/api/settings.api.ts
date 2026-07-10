import { publicApi, privateApi } from "@/shared/infrastructure/http";
import type { Settings, SettingsUpdate } from "@/core/settings";

export async function fetchSettings(): Promise<Settings> {
  const { data } = await publicApi.get<Settings>("/api/settings");
  return data;
}

export async function updateSettings(patch: SettingsUpdate): Promise<Settings> {
  const { data } = await privateApi.patch<Settings>("/api/settings", patch);
  return data;
}

export async function uploadLogo(file: File): Promise<Settings> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await privateApi.post<Settings>(
    "/api/settings/logo",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function removeLogo(): Promise<Settings> {
  const { data } = await privateApi.delete<Settings>("/api/settings/logo");
  return data;
}
