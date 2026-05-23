import { Header } from "@/components/header";
import { CategoryTabs } from "@/components/category-tabs";
import { CatalogSections } from "@/components/catalog-sections";
import { CartButton } from "@/components/cart-button";
import { SourceCapture } from "@/components/source-capture";
import { RepeatLastOrder } from "@/components/repeat-last-order";
import { SiteFooter } from "@/components/site-footer";
import { createServerApiClient } from "@/lib/api-server";
import { products as fallbackProducts } from "@/lib/data/products";
import { categories as fallbackCategories } from "@/lib/data/categories";
import type { CategoryDef, Product } from "@mercabana/core";

async function loadCatalog(): Promise<{ products: Product[]; categories: CategoryDef[] }> {
  try {
    const client = createServerApiClient();
    const [products, categories] = await Promise.all([
      client.products.list(),
      client.categories.list(),
    ]);
    return { products, categories };
  } catch (err) {
    console.warn("[home] API not reachable, using local seed:", err);
    return { products: fallbackProducts, categories: fallbackCategories };
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const active = params.cat?.trim() ?? "todas";
  const { products, categories } = await loadCatalog();

  return (
    <>
      <SourceCapture />
      <Header adminLink />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 lg:px-6">
        <section className="border-b border-[var(--color-line)] pt-10 pb-7">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-700">
            Catálogo mayorista · hoy
          </span>
          <h1 className="mt-3 font-display text-[32px] leading-[1.05] text-[var(--color-ink)] sm:text-[40px] lg:text-[48px]">
            Producto de Mercabarna,<br />
            directo a tu negocio.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            Precios por caja, escogidos en lonja por la mañana. Confirmamos por
            WhatsApp y entregamos en el día. Pago a la entrega.
          </p>
        </section>

        <div className="mt-6">
          <RepeatLastOrder />
        </div>

        <CategoryTabs active={active} seedCategories={categories} />

        <CatalogSections
          seed={products}
          seedCategories={categories}
          activeCategory={active}
        />
      </main>
      <SiteFooter />
      <CartButton />
    </>
  );
}
