"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { Settings, SettingsUpdate } from "@/core/settings";
import { settingsKeys } from "./keys";
import { fetchSettings, removeLogo, updateSettings, uploadLogo } from "./settings.api";

export function useSettingsQuery() {
  return useQuery<Settings, AppError>({
    queryKey: settingsKeys.all,
    queryFn: fetchSettings,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation<Settings, AppError, SettingsUpdate>({
    mutationFn: updateSettings,
    onSuccess: (fresh) => qc.setQueryData(settingsKeys.all, fresh),
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation<Settings, AppError, File>({
    mutationFn: uploadLogo,
    onSuccess: (fresh) => qc.setQueryData(settingsKeys.all, fresh),
  });
}

export function useRemoveLogo() {
  const qc = useQueryClient();
  return useMutation<Settings, AppError, void>({
    mutationFn: removeLogo,
    onSuccess: (fresh) => qc.setQueryData(settingsKeys.all, fresh),
  });
}
