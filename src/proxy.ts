import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/core/auth/infrastructure/authjs.config";
import { isAdmin } from "@/core/shared";

const { auth: proxy } = NextAuth(authConfig);

export default proxy((req) => {
  if (!isAdmin(req.auth?.user?.role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.searchParams.set("auth", "login");
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
