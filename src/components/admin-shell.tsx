"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tenant } from "@/lib/data/tenant";

const tabs = [
  { href: "/admin", label: "Hoy", emoji: "🏠" },
  { href: "/admin/pedidos", label: "Pedidos", emoji: "📦" },
  { href: "/admin/productos", label: "Productos", emoji: "🥬" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-base shadow-sm"
              aria-hidden
            >
              {tenant.emoji}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-stone-900">{tenant.name}</span>
              <span className="text-[10px] uppercase tracking-wide text-stone-500">Panel admin</span>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
          >
            Ver tienda
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5">{children}</main>

      <nav
        aria-label="Navegación admin"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-1.5">
          {tabs.map((t) => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <span className="text-lg" aria-hidden>{t.emoji}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
