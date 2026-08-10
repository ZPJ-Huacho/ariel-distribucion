import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/core/shared";

// Config EDGE-SAFE: sin providers ni adapter con dependencias de Node.
// Se usa desde middleware.ts. La config completa (con Credentials +
// verificación de password) vive en authjs.ts y es server-only.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/?auth=login" },
  providers: [],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        const u = user as {
          id?: string;
          role?: Role;
          image?: string | null;
          name?: string | null;
        };
        token.id = u.id;
        token.role = u.role;
        token.picture = u.image ?? token.picture ?? null;
        if (u.name) token.name = u.name;
      }
      if (account?.provider) {
        token.provider = account.provider === "google" ? "google" : "credentials";
      }
      return token;
    },
    session: ({ session, token }) => {
      const t = token as {
        id?: string;
        role?: Role;
        picture?: string | null;
        provider?: "credentials" | "google";
      };
      if (t.id) session.user.id = t.id;
      if (t.role) session.user.role = t.role;
      session.user.image = t.picture ?? null;
      session.user.provider = t.provider ?? "credentials";
      return session;
    },
  },
} satisfies NextAuthConfig;
