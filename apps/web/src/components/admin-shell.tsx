"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Sprout,
  Tags,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { tenant } from "@/lib/data/tenant";
import { createBrowserApiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useToast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

type Tab = { href: string; label: string; icon: React.ReactNode };

const tabs: Tab[] = [
  { href: "/admin", label: "Resumen", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/pedidos", label: "Pedidos", icon: <Receipt className="h-4 w-4" /> },
  { href: "/admin/productos", label: "Productos", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/categorias", label: "Categorías", icon: <Tags className="h-4 w-4" /> },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const showToast = useToast((s) => s.show);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, router, pathname]);

  async function handleLogout() {
    try {
      await createBrowserApiClient().auth.logout();
    } catch {}
    logout();
    showToast("Sesión cerrada");
    router.push("/");
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Redirigiendo…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <SidebarBrand />
        <SidebarNav pathname={pathname} onNavigate={() => {}} />
        <SidebarFooter user={user} onLogout={handleLogout} />
      </aside>

      {/* Top bar mobile */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted")}>
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navegación admin</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <SidebarBrand />
                <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                <SidebarFooter user={user} onLogout={handleLogout} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sprout className="h-3.5 w-3.5" />
            </span>
            <span className="text-[13px] font-semibold tracking-tight">
              {tenant.name}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-[10.5px] font-semibold text-primary-foreground">
                  {user.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
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
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/perfil")}>
                  <UserIcon className="h-4 w-4" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/")}>
                  <ExternalLink className="h-4 w-4" />
                  Ver tienda
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarBrand() {
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2.5 border-b border-border px-5 py-4 transition hover:bg-muted/50"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sprout className="h-4.5 w-4.5" />
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[14px] font-semibold tracking-tight text-foreground">
          {tenant.name}
        </span>
        <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Panel admin
        </span>
      </div>
    </Link>
  );
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="inline-flex items-center gap-2.5">
              {tab.icon}
              {tab.label}
            </span>
            {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  user,
  onLogout,
}: {
  user: { name: string; email: string };
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-border p-3">
      <Link
        href="/"
        className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[12px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <span>Ver tienda</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
      <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
            {user.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[12.5px] font-semibold text-foreground">
            {user.name}
          </span>
          <span className="truncate text-[10.5px] text-muted-foreground">
            {user.email}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cerrar sesión"
          onClick={onLogout}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
