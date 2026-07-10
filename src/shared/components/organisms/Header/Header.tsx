"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useSettings } from "@/shared/providers/SettingsProvider";
import { useCart } from "@/shared/lib/cart-store";
import { getActiveTheme } from "@/shared/lib/themes";
import { cn } from "@/shared/lib/utils";
import { SVG_ASSETS } from "@/shared/assets/svg";
import { UserMenu } from "./UserMenu";

export function Header({ overHero = false }: { overHero?: boolean }) {
  const s = useSettings();
  const theme = getActiveTheme(s.theme);
  const count = useCart((c) => c.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <header
      data-site-header
      className={cn(
        "relative z-30 border-b text-white",
        overHero
          ? "border-white/10 [backdrop-filter:blur(20px)_saturate(180%)] supports-[not_(backdrop-filter:blur(1px))]:bg-neutral-950/80"
          : "border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_24px_-12px_rgba(0,0,0,0.5)]",
      )}
      style={
        overHero
          ? { background: "rgba(10, 14, 22, 0.28)" }
          : {
              background: `linear-gradient(180deg,
                color-mix(in oklch, var(--primary) 32%, #0b0f16) 0%,
                color-mix(in oklch, var(--primary) 22%, #0a0d13) 100%)`,
            }
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 lg:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold"
          aria-label={`${s.businessName} - Ir al catálogo`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.logoUrl || SVG_ASSETS.logoHorizontal}
            alt=""
            aria-hidden
            className="h-8 w-auto max-w-[130px] shrink-0 object-contain sm:h-9"
          />
          <span className="hidden truncate sm:inline">{s.businessName}</span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-1 text-sm md:flex"
        >
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/#catalogo">Catálogo</NavLink>
          <NavLink href="/pedido">Mi pedido</NavLink>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/pedido"
            aria-label={
              count > 0 ? `Ver carrito (${count} productos)` : "Ver carrito"
            }
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-white outline-none ring-1 ring-white/20 transition-all hover:bg-white/10 hover:ring-white/40 focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <ShoppingCart className="h-[18px] w-[18px]" aria-hidden />
            {count > 0 && (
              <span
                aria-hidden
                className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-primary shadow-sm"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <UserMenu glass />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-full px-3 py-1.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-white transition-transform duration-200 group-hover:scale-x-100"
      />
    </Link>
  );
}
