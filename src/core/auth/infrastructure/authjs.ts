import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./authjs.config";
import { getUserRepository, VerifyCredentialsUseCase, loginSchema } from "@/core/users";

type Role = "admin" | "customer";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const useCase = new VerifyCredentialsUseCase(getUserRepository());
        const user = await useCase.execute(parsed.data.email, parsed.data.password);
        return user
          ? {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          : null;
      },
    }),
  ],
});
