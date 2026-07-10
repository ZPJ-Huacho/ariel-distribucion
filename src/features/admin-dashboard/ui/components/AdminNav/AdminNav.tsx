"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

type AdminNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchExact?: boolean;
};

const ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, matchExact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/ajustes", label: "Ajustes", icon: SlidersHorizontal },
];

function isActiveItem(pathname: string, item: AdminNavItem): boolean {
  if (item.matchExact) return pathname === item.href;
  return pathname.startsWith(item.href);
}

export function AdminNav({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Panel de administración"
        className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div
          className="mx-auto flex max-w-md items-stretch gap-1 border-t border-white/[0.08] px-2 py-2 text-white [backdrop-filter:blur(24px)_saturate(180%)]"
          style={{
            background: `
              linear-gradient(180deg,
                color-mix(in oklch, var(--primary) 22%, transparent) 0%,
                color-mix(in oklch, var(--primary) 12%, transparent) 100%),
              rgba(9, 12, 18, 0.9)`,
          }}
        >
          {ITEMS.map((item) => {
            const { href, label, icon: Icon } = item;
            const active = isActiveItem(pathname, item);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                  active
                    ? "bg-white text-primary"
                    : "text-white/80 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Panel de administración"
      className="hidden min-w-0 flex-1 items-center justify-center gap-1 text-sm md:flex"
    >
      {ITEMS.map((item) => {
        const { href, label, icon: Icon } = item;
        const active = isActiveItem(pathname, item);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            title={label}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors lg:px-3",
              active
                ? "bg-white text-primary shadow-sm"
                : "text-white/85 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 lg:h-3.5 lg:w-3.5" aria-hidden />
            <span className="hidden lg:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
