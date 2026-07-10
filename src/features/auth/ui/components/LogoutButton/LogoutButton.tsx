"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/shared/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      aria-label="Cerrar sesión"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-medium text-white/85 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 sm:text-sm",
        className,
      )}
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden sm:inline">Salir</span>
    </button>
  );
}
