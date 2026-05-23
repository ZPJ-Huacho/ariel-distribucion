"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { tenant } from "@/lib/data/tenant";
import { createBrowserApiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useToast } from "@/lib/toast-store";

type Tab = { href: string; label: string; icon: React.ReactNode };

const tabs: Tab[] = [
  {
    href: "/admin",
    label: "Resumen",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    href: "/admin/categorias",
    label: "Categorías",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const showToast = useToast((s) => s.show);

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
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] text-sm text-[var(--color-ink-mute)]">
        Cargando…
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] text-sm text-[var(--color-ink-mute)]">
        Redirigiendo…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] pb-24">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-md border border-brand-700 bg-brand-800 font-display text-[13px] font-semibold tracking-tight text-accent-100"
              aria-hidden
            >
              FM
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-[14px] text-[var(--color-ink)]">
                {tenant.name}
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-mute)]">
                Panel · {user.name.split(" ")[0]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)]"
            >
              Tienda
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)]"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6">{children}</main>

      <nav
        aria-label="Navegación admin"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-line)] bg-[var(--color-canvas)]/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-1.5 lg:px-6">
          {tabs.map((t) => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                  isActive
                    ? "bg-brand-800 text-accent-100"
                    : "text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span aria-hidden>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
