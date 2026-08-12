import { privateApi } from "@/shared/infrastructure/http";
import type { Role } from "@/core/shared";
import type { User } from "@/core/users";

export async function fetchUsers(): Promise<User[]> {
  const { data } = await privateApi.get<User[]>("/api/users");
  return data;
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  const { data } = await privateApi.patch<User>(`/api/users/${id}/role`, {
    role,
  });
  return data;
}
