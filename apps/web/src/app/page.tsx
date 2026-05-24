import { Sparkles } from "lucide-react";
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

async function loadCatalog(): Promise<{
  products: Product[];
  categories: CategoryDef[];
}> {
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
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 lg:px-6">
        <section className="pt-14 pb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Frescos de hoy · Mercabarna
          </div>
          <h1 className="mt-5 max-w-3xl text-[34px] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[44px] lg:text-[54px]">
            Producto de lonja,{" "}
            <span className="text-primary">directo a tu negocio.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Precios por caja, escogidos en lonja por la mañana. Confirmamos por
            WhatsApp y entregamos en el día. Pago a la entrega.
          </p>
        </section>

        <RepeatLastOrder />

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
