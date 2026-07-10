"use client";

import Link from "next/link";
import type { Category } from "@/core/categories";
import { cn } from "@/shared/lib/utils";

export function CategoryPills({
  active,
  categories,
}: {
  active: string;
  categories: Category[];
}) {
  const tabs = [
    { id: "todas", label: "Todo" },
    ...categories.map((c) => ({ id: c.slug, label: c.title })),
  ];

  return (
    <nav
      aria-label="Categorías"
      className="no-scrollbar -mx-4 flex items-center gap-6 overflow-x-auto border-b border-primary/15 px-4 py-2 lg:-mx-6 lg:px-6"
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <Link
            key={t.id}
            href={t.id === "todas" ? "/" : `/?cat=${t.id}`}
            className={cn(
              "relative shrink-0 pb-2 pt-1 text-sm transition-colors",
              isActive
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            {t.label}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 -bottom-[9px] h-[2px] rounded-full bg-primary transition-transform duration-200",
                isActive ? "scale-x-100" : "scale-x-0",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
