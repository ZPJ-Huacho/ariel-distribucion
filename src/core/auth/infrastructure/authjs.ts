import { randomBytes } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
      image: string | null;
      provider: "credentials" | "google";
    };
  }
}

const googleConfigured = !!(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

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
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn: async ({ user, account, profile }) => {
      if (account?.provider !== "google") return true;
      const email = (profile?.email ?? user.email ?? "").toLowerCase();
      if (!email) return false;

      const picture =
        (typeof profile?.picture === "string" ? profile.picture : null) ??
        user.image ??
        null;

      const repo = getUserRepository();
      const existing = await repo.findByEmail(email);
      if (existing) {
        user.id = existing.id;
        user.role = existing.role;
        user.name = existing.name;
        user.image = picture;
        return true;
      }
      const created = await repo.create({
        email,
        name: user.name ?? profile?.name ?? email.split("@")[0],
        phone: null,
        passwordHash: `google:${randomBytes(24).toString("hex")}`,
      });
      user.id = created.id;
      user.role = created.role;
      user.name = created.name;
      user.image = picture;
      return true;
    },
  },
});
