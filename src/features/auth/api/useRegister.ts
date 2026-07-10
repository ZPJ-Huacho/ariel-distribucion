"use client";

import { useMutation } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { RegisterInput, User } from "@/core/users";
import { registerUser } from "./auth.api";

export function useRegister() {
  return useMutation<User, AppError, RegisterInput>({
    mutationFn: registerUser,
  });
}
