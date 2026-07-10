import { publicApi } from "@/shared/infrastructure/http";
import type { RegisterInput, User } from "@/core/users";

export async function registerUser(input: RegisterInput): Promise<User> {
  const { data } = await publicApi.post<{ user: User }>(
    "/api/auth/register",
    input,
  );
  return data.user;
}
