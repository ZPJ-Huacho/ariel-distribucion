"use client";

import { useMutation } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { RegisterInput, User } from "@/core/users";
import { registerUser } from "./auth.api";

type Input = RegisterInput & { _ts?: string | null; _hp?: string };

export function useRegister() {
  return useMutation<User, AppError, Input>({
    mutationFn: registerUser,
  });
}
