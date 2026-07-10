import { privateApi } from "@/shared/infrastructure/http";
import type { UpdateProfileInput, User } from "@/core/users";

export async function fetchProfile(): Promise<User | null> {
  const { data } = await privateApi.get<{ user: User | null }>("/api/auth/me");
  return data.user;
}

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const { data } = await privateApi.patch<{ user: User }>("/api/auth/me", input);
  return data.user;
}
