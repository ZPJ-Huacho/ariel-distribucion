"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, LayoutGrid, ShoppingCart, User, ArrowUp } from "lucide-react";
import { useCart } from "@/shared/lib/cart-store";
import { cn } from "@/shared/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchExact?: boolean;
};

const ITEMS: Item[] = [
  { href: "/", label: "Inicio", icon: Home, matchExact: true },
  { href: "/#catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/pedido", label: "Carrito", icon: ShoppingCart },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function FloatingNav() {
  const pathname = usePathname();
  const [revealed, setRevealed] = useState(false);
  const cartCount = useCart((c) =>
    c.items.reduce((n, i) => n + i.quantity, 0),
  );

  useEffect(() => {
    const sentinel = document.querySelector<HTMLElement>(
      "[data-nav-sentinel]",
    );
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      const onScroll = () => setRevealed(window.scrollY > 60);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
    const observer = new IntersectionObserver(
      ([entry]) => setRevealed(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const isActive = (it: Item) => {
    if (it.matchExact) return pathname === "/";
    const path = it.href.split("#")[0] || "/";
    return path !== "/" && pathname.startsWith(path);
  };

  return (
    <>
      <nav
        aria-label="Navegación flotante"
        className={cn(
          "pointer-events-none fixed left-1/2 top-4 z-40 hidden -translate-x-1/2 transition-all duration-300 motion-reduce:transition-none md:block",
          revealed
            ? "opacity-100 translate-y-0"
            : "-translate-y-6 opacity-0",
        )}
        aria-hidden={!revealed}
      >
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border border-white/[0.08] px-2 py-1.5 text-sm text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] [backdrop-filter:blur(24px)_saturate(180%)]",
            revealed ? "pointer-events-auto" : "pointer-events-none",
          )}
          style={{
            background: `
              linear-gradient(180deg,
                color-mix(in oklch, var(--primary) 20%, transparent) 0%,
                color-mix(in oklch, var(--primary) 10%, transparent) 100%),
              rgba(9, 12, 18, 0.62)`,
          }}
        >
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const active = isActive(it);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                aria-label={it.label}
                className={cn(
                  "group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{it.label}</span>
                {it.href === "/pedido" && cartCount > 0 && (
                  <span
                    className={cn(
                      "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold shadow-sm",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-primary",
                    )}
                    aria-label={`${cartCount} productos`}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            aria-label="Volver arriba"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="ml-1 grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </nav>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch gap-1 border-t border-white/[0.08] px-2 py-2 text-white [backdrop-filter:blur(24px)_saturate(180%)]"
          style={{
            background: `
              linear-gradient(180deg,
                color-mix(in oklch, var(--primary) 22%, transparent) 0%,
                color-mix(in oklch, var(--primary) 12%, transparent) 100%),
              rgba(9, 12, 18, 0.72)`,
          }}
        >
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const active = isActive(it);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                aria-label={it.label}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                  active
                    ? "bg-white text-primary"
                    : "text-white/80 hover:text-white",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden />
                  {it.href === "/pedido" && cartCount > 0 && (
                    <span
                      className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[9px] font-bold text-primary shadow-sm"
                      aria-label={`${cartCount} productos`}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function SkipToContent({ target = "#catalogo" }: { target?: string }) {
  return (
    <a
      href={target}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
    >
      Saltar al catálogo
    </a>
  );
}
