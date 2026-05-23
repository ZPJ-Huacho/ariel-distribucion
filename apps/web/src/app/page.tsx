import { Header } from "@/components/header";
import { CategoryTabs } from "@/components/category-tabs";
import { CatalogSections } from "@/components/catalog-sections";
import { CartButton } from "@/components/cart-button";
import { SourceCapture } from "@/components/source-capture";
import { RepeatLastOrder } from "@/components/repeat-last-order";
import { SiteFooter } from "@/components/site-footer";
import { products as seed } from "@/lib/data/products";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const active = params.cat?.trim() ?? "todas";

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

        <CategoryTabs active={active} />

        <CatalogSections seed={seed} activeCategory={active} />
      </main>
      <SiteFooter />
      <CartButton />
    </>
  );
}
