"use client";

import { useQuery } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { User } from "@/core/users";
import { profileKeys } from "./keys";
import { fetchProfile } from "./profile.api";

export function useProfile(initialData?: User) {
  return useQuery<User | null, AppError>({
    queryKey: profileKeys.me(),
    queryFn: fetchProfile,
    initialData: initialData ?? undefined,
    staleTime: 30_000,
  });
}
