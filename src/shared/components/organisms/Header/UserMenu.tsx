"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  User as UserIcon,
} from "lucide-react";
import { useCurrentUser } from "@/shared/providers/UserProvider";
import { useAuthDialog } from "@/shared/providers/AuthDialogProvider";
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
  const { open } = useAuthDialog();

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => open({ tab: "login" })}
        aria-label="Entrar o crear cuenta"
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2",
          glass
            ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20 focus-visible:ring-white/60"
            : "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 focus-visible:ring-primary/40",
        )}
      >
        <UserIcon className="h-4 w-4" aria-hidden />
        <span>Mi cuenta</span>
      </button>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = user.name.split(" ")[0];
  const isGoogle = user.provider === "google";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menú de ${user.name}`}
        className={cn(
          "group inline-flex h-9 shrink-0 items-center gap-2 rounded-full outline-none transition-all focus-visible:ring-2 focus-visible:ring-white/60",
          "pl-0.5 pr-1 sm:pr-2",
          glass
            ? "bg-white/10 ring-1 ring-white/20 hover:bg-white/15 hover:ring-white/40 aria-expanded:ring-2 aria-expanded:ring-white/60"
            : "bg-primary/10 ring-1 ring-primary/20 hover:bg-primary/15 aria-expanded:ring-2 aria-expanded:ring-primary/40",
        )}
      >
        <Avatar
          name={user.name}
          image={user.image}
          initials={initials}
          isGoogle={isGoogle}
          size={32}
        />
        <span
          className={cn(
            "hidden max-w-[110px] truncate text-sm font-semibold sm:inline",
            glass ? "text-white" : "text-foreground",
          )}
        >
          {firstName}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform group-aria-expanded:rotate-180",
            glass ? "text-white/70" : "text-muted-foreground",
          )}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="flex min-w-[280px] flex-col gap-2 p-2"
      >
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
          <Avatar
            name={user.name}
            image={user.image}
            initials={initials}
            isGoogle={isGoogle}
            size={44}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-sm font-semibold leading-tight">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            {isGoogle && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                <GoogleGlyph />
                Conectado con Google
              </p>
            )}
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

function Avatar({
  name,
  image,
  initials,
  isGoogle,
  size,
}: {
  name: string;
  image: string | null;
  initials: string;
  isGoogle: boolean;
  size: number;
}) {
  const dim = { width: size, height: size };
  return (
    <span className="relative shrink-0" style={dim}>
      <span
        aria-hidden
        className="grid overflow-hidden rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-white/60"
        style={dim}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            referrerPolicy="no-referrer"
            width={size}
            height={size}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="grid h-full w-full place-items-center font-semibold"
            style={{ fontSize: Math.max(11, Math.round(size * 0.38)) }}
          >
            {initials || <UserIcon className="h-4 w-4" />}
          </span>
        )}
      </span>
      {isGoogle && image && (
        <span
          aria-hidden
          title="Cuenta de Google"
          className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"
        >
          <GoogleGlyph size={9} />
        </span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

function GoogleGlyph({ size = 10 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
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
