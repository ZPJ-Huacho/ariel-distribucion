"use client";

import Link from "next/link";
import type { CategoryDef } from "@mercabana/core";

export function CategoryTabs({
  active,
  seedCategories,
}: {
  active: string;
  seedCategories: CategoryDef[];
}) {
  const sorted = [...seedCategories].sort((a, b) => a.sortOrder - b.sortOrder);

  const tabs = [
    { id: "todas", label: "Todo" },
    ...sorted.map((c) => ({ id: c.slug, label: c.title })),
  ];

  return (
    <nav
      aria-label="Categorías"
      className="no-scrollbar sticky top-[64px] z-20 -mx-4 flex items-center gap-2 overflow-x-auto border-b border-[var(--color-line)] bg-[var(--color-canvas)]/95 px-4 py-2.5 backdrop-blur lg:-mx-6 lg:px-6"
    >
      {tabs.map((cat) => {
        const isActive = active === cat.id;
        const href = cat.id === "todas" ? "/" : `/?cat=${cat.id}`;
        return (
          <Link
            key={cat.id}
            href={href}
            scroll={false}
            className={`shrink-0 rounded-md border px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-wide transition ${
              isActive
                ? "border-brand-800 bg-brand-800 text-accent-100"
                : "border-[var(--color-line)] bg-transparent text-[var(--color-ink-soft)] hover:border-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}
