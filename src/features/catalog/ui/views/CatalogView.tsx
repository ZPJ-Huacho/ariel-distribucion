import {
  GetSettingsUseCase,
  getSettingsRepository,
} from "@/core/settings";
import {
  ListCategoriesUseCase,
  getCategoryRepository,
} from "@/core/categories";
import {
  ListProductsUseCase,
  getProductRepository,
} from "@/core/products";
import { Header } from "@/shared/components/organisms/Header";
import { SiteFooter } from "@/shared/components/organisms/SiteFooter";
import {
  FloatingNav,
  SkipToContent,
} from "@/shared/components/organisms/FloatingNav";
import { CategoryPills } from "../components/CategoryPills";
import { CartBar } from "../components/CartBar";
import { CatalogFilters } from "../components/CatalogFilters";
import { Hero } from "../components/Hero";
import { PromoBanner } from "../components/PromoBanner";
import { TopProducts } from "../components/TopProducts";

export type CatalogViewParams = { cat?: string };

const TOP_LIMIT = 6;

export async function CatalogView({ params }: { params: CatalogViewParams }) {
  const active = params.cat?.trim() ?? "todas";

  const [settings, categories, products, allProducts] = await Promise.all([
    new GetSettingsUseCase(getSettingsRepository()).execute(),
    new ListCategoriesUseCase(getCategoryRepository()).execute(),
    new ListProductsUseCase(getProductRepository()).execute(
      active === "todas" ? undefined : active,
    ),
    active === "todas"
      ? Promise.resolve(null)
      : new ListProductsUseCase(getProductRepository()).execute(),
  ]);

  const base = allProducts ?? products;
  const highlighted = base
    .filter((p) => p.isHighlighted && p.isAvailable)
    .slice(0, TOP_LIMIT);
  const topProducts =
    highlighted.length > 0
      ? highlighted
      : base.filter((p) => p.isAvailable).slice(0, TOP_LIMIT);

  const activeLabel =
    active === "todas"
      ? "todo el catálogo"
      : (
          categories.find((c) => c.slug === active)?.title ?? "categoría"
        ).toLowerCase();

  return (
    <>
      <SkipToContent />
      <Header overHero />
      <div aria-hidden data-nav-sentinel className="h-px w-full" />
      <Hero />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 pb-32 pt-14 lg:px-6">
        <TopProducts products={topProducts} />

        <PromoBanner />

        <section id="catalogo" className="flex scroll-mt-24 flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3 text-primary">
              <span aria-hidden className="h-px w-8 bg-primary/40" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em]">
                Nuestro catálogo
              </span>
              <span aria-hidden className="h-px w-8 bg-primary/40" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl">
              Catálogo de <span className="text-primary">productos</span>
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Explora {activeLabel} y arma tu pedido en minutos.
            </p>
          </div>

          <CategoryPills active={active} categories={categories} />

          <CatalogFilters products={products} />
        </section>
      </main>

      <SiteFooter />
      <FloatingNav />
      <CartBar />
    </>
  );
}
