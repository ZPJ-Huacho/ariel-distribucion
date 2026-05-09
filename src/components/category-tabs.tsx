import Link from "next/link";

const categories = [
  { id: "todas", label: "Todo", emoji: "🛒" },
  { id: "frutas", label: "Frutas", emoji: "🍎" },
  { id: "verduras", label: "Verduras", emoji: "🥬" },
  { id: "tropical", label: "Tropical", emoji: "🥑" },
] as const;

export function CategoryTabs({ active }: { active: string }) {
  return (
    <nav
      aria-label="Categorías"
      className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-3"
    >
      {categories.map((cat) => {
        const isActive = active === cat.id;
        const href = cat.id === "todas" ? "/" : `/?cat=${cat.id}`;
        return (
          <Link
            key={cat.id}
            href={href}
            scroll={false}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
            }`}
          >
            <span className="mr-1.5" aria-hidden>{cat.emoji}</span>
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}
