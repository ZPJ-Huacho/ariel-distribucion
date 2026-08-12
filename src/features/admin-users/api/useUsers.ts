"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { Role } from "@/core/shared";
import type { User } from "@/core/users";
import { userKeys } from "./keys";
import { fetchUsers, updateUserRole } from "./users.api";

export function useUsers() {
  return useQuery<User[], AppError>({
    queryKey: userKeys.list(),
    queryFn: fetchUsers,
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation<User, AppError, { id: string; role: Role }>({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}
