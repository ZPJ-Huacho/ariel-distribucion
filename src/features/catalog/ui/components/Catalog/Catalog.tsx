import type { Product } from "@/core/products";
import { ProductCard } from "../ProductCard";

export function Catalog({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 py-16 text-center text-muted-foreground">
        Todavía no hay productos publicados.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 min-[426px]:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
