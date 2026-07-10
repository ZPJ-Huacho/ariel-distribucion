"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  PackageOpen,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { useCurrentUser } from "@/shared/providers/UserProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/atoms/dropdown-menu";
import { cn } from "@/shared/lib/utils";

export function UserMenu({ glass = false }: { glass?: boolean }) {
  const user = useCurrentUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/login"
          className={cn(
            "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2",
            glass
              ? "text-white hover:bg-white/10 focus-visible:ring-white/40"
              : "text-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/40",
          )}
        >
          <LogIn className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Entrar</span>
        </Link>
        <Link
          href="/registro"
          className="hidden h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-white/40 sm:inline-flex"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          <span>Regístrate</span>
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menú de ${user.name}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-primary-foreground outline-none ring-1 ring-white/20 transition-all hover:ring-white/40 aria-expanded:ring-2 aria-expanded:ring-white/60 focus-visible:ring-2 focus-visible:ring-white/60"
        style={{ background: "var(--primary)" }}
      >
        {initials || <UserIcon className="h-4 w-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="flex min-w-[260px] flex-col gap-2 p-2"
      >
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm"
          >
            {initials || <UserIcon className="h-4 w-4" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-sm font-semibold leading-tight">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <MenuItem
            icon={UserIcon}
            label="Mi perfil"
            hint="Datos, entrega y seguridad"
            onClick={() => router.push("/perfil")}
          />
          <MenuItem
            icon={PackageOpen}
            label="Mis pedidos"
            hint="Historial y estado"
            onClick={() => router.push("/perfil?tab=orders")}
          />
          {user.role === "admin" && (
            <MenuItem
              icon={LayoutDashboard}
              label="Panel admin"
              hint="Gestión del negocio"
              onClick={() => router.push("/admin")}
            />
          )}
        </div>

        <DropdownMenuSeparator />

        <MenuItem
          icon={LogOut}
          label="Cerrar sesión"
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuItem({
  icon: Icon,
  label,
  hint,
  onClick,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30",
        variant === "destructive"
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-primary/8",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
          variant === "destructive"
            ? "bg-destructive/10 text-destructive group-hover:bg-destructive/15"
            : "bg-primary/10 text-primary group-hover:bg-primary/15",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium leading-tight">
          {label}
        </span>
        {hint && (
          <span className="truncate text-[11px] text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      {variant !== "destructive" && (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
          aria-hidden
        />
      )}
    </button>
  );
}
