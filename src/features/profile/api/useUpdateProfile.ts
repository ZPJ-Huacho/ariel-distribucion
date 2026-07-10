"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { UpdateProfileInput, User } from "@/core/users";
import { profileKeys } from "./keys";
import { updateProfile } from "./profile.api";

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<User, AppError, UpdateProfileInput>({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      qc.setQueryData(profileKeys.me(), user);
    },
  });
}
