import { Header } from "@/components/header";
import { CategoryTabs } from "@/components/category-tabs";
import { ProductCard } from "@/components/product-card";
import { CartButton } from "@/components/cart-button";
import { SourceCapture } from "@/components/source-capture";
import { RepeatLastOrder } from "@/components/repeat-last-order";
import { getProductsByCategory } from "@/lib/data/products";
import { tenant } from "@/lib/data/tenant";
import type { Category } from "@/lib/data/types";

const validCategories: ReadonlyArray<Category | "todas"> = [
  "todas",
  "frutas",
  "verduras",
  "tropical",
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const requested = params.cat ?? "todas";
  const active = (validCategories.includes(requested as Category | "todas")
    ? requested
    : "todas") as Category | "todas";
  const list = getProductsByCategory(active);

  return (
    <>
      <SourceCapture />
      <Header adminLink />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32">
        <section className="pt-5 pb-2">
          <h1 className="text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
            {tenant.tagline}
          </h1>
          <p className="mt-1.5 text-sm text-stone-600">
            Pide en 30 segundos. Te lo confirmamos por WhatsApp y lo entregamos en el día.
          </p>
        </section>

        <div className="mt-3 mb-1">
          <RepeatLastOrder />
        </div>

        <CategoryTabs active={active} />

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>

        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500">
            No hay productos en esta categoría hoy.
          </div>
        )}

        <footer className="mt-10 border-t border-stone-200 pt-6 text-xs text-stone-500">
          <p className="font-medium text-stone-700">{tenant.name}</p>
          <p>{tenant.address} · {tenant.deliveryHours}</p>
          <p className="mt-2">© {new Date().getFullYear()} · Demo de Mercadigital</p>
        </footer>
      </main>
      <CartButton />
    </>
  );
}
