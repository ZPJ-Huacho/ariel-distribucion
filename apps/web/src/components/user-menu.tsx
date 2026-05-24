"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createBrowserApiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useToast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const router = useRouter();
  const showToast = useToast((s) => s.show);

  if (!hydrated) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(buttonVariants({ size: "sm" }), "h-9 rounded-full px-4")}
      >
        <LogIn className="h-3.5 w-3.5" />
        Acceder
      </Link>
    );
  }

  async function handleLogout() {
    try {
      await createBrowserApiClient().auth.logout();
    } catch {}
    logout();
    showToast("Sesión cerrada");
    router.push("/");
    router.refresh();
  }

  const initials =
    user.name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "·";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border/80 bg-card pl-1 pr-3 py-1 transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-[12.5px] font-medium text-foreground sm:inline">
          {user.name.split(" ")[0]}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate text-[13px] font-semibold text-foreground">
              {user.name}
            </span>
            <span className="truncate text-[11.5px] font-normal text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "admin" && (
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <LayoutDashboard className="h-4 w-4" />
            Panel admin
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push("/perfil")}>
          <UserIcon className="h-4 w-4" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
