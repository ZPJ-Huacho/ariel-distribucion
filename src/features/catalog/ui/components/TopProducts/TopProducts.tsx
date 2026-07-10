import type { Product } from "@/core/products";
import { ProductCard } from "../ProductCard";

export function TopProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section
      aria-labelledby="top-productos"
      className="relative overflow-hidden rounded-3xl border border-primary/15 p-6 sm:p-10"
      style={{
        background: `radial-gradient(120% 100% at 50% 0%,
          color-mix(in oklch, var(--primary) 10%, var(--background)) 0%,
          var(--background) 70%)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 60%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3 text-primary">
            <span aria-hidden className="h-px w-8 bg-primary/40" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">
              Lo más pedido
            </span>
            <span aria-hidden className="h-px w-8 bg-primary/40" />
          </div>
          <h2 id="top-productos" className="font-display text-4xl sm:text-5xl">
            Top de <span className="text-primary">productos</span>
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Los favoritos de nuestros clientes esta semana, recién seleccionados.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[426px]:grid-cols-2 md:grid-cols-3 md:gap-4 lg:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
