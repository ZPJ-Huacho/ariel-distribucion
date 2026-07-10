import type { NextAuthConfig } from "next-auth";

// Config EDGE-SAFE: sin providers ni adapter con dependencias de Node.
// Se usa desde middleware.ts. La config completa (con Credentials +
// verificación de password) vive en authjs.ts y es server-only.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: "admin" | "customer" }).role;
      }
      return token;
    },
    session: ({ session, token }) => {
      const t = token as { id?: string; role?: "admin" | "customer" };
      if (t.id) session.user.id = t.id;
      if (t.role) session.user.role = t.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
