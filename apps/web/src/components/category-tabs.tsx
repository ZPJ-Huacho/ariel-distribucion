"use client";

import Link from "next/link";
import type { CategoryDef } from "@mercabana/core";
import { cn } from "@/lib/utils";

export function CategoryTabs({
  active,
  seedCategories,
}: {
  active: string;
  seedCategories: CategoryDef[];
}) {
  const sorted = [...seedCategories].sort((a, b) => a.sortOrder - b.sortOrder);

  const tabs = [
    { id: "todas", label: "Todo", icon: "✨" },
    ...sorted.map((c) => ({ id: c.slug, label: c.title, icon: c.icon })),
  ];

  return (
    <nav
      aria-label="Categorías"
      className="no-scrollbar sticky top-16 z-20 -mx-4 flex items-center gap-1.5 overflow-x-auto border-b border-border/60 bg-background/85 px-4 py-2.5 backdrop-blur-xl lg:-mx-6 lg:px-6"
    >
      {tabs.map((cat) => {
        const isActive = active === cat.id;
        const href = cat.id === "todas" ? "/" : `/?cat=${cat.id}`;
        return (
          <Link
            key={cat.id}
            href={href}
            scroll={false}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            <span aria-hidden className="text-[13px]">
              {cat.icon}
            </span>
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}
