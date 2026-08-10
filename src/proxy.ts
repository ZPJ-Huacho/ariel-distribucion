import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/core/auth/infrastructure/authjs.config";
import { isAdmin } from "@/core/shared";

const { auth: proxy } = NextAuth(authConfig);

export default proxy((req) => {
  const user = req.auth?.user;
  if (isAdmin(user?.role)) return;

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";

  if (!user) {
    // Sin sesión → abre el modal de login pegado al catálogo.
    url.searchParams.set("auth", "login");
    url.searchParams.set("next", req.nextUrl.pathname);
  } else {
    // Autenticado pero sin permisos → toast + al catálogo. Nada de modal.
    url.searchParams.set("error", "forbidden");
  }
  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/admin/:path*"],
};
