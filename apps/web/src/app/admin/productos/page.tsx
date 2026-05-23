import { AdminProductsList } from "@/components/admin-products-list";
import { createRequestApiClient } from "@/lib/api-server";
import { products as fallbackProducts } from "@/lib/data/products";
import { categories as fallbackCategories } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export default async function AdminProductos() {
  const client = await createRequestApiClient();
  let products = fallbackProducts;
  let categories = fallbackCategories;
  try {
    [products, categories] = await Promise.all([
      client.products.list(),
      client.categories.list(),
    ]);
  } catch (err) {
    console.warn("[admin/productos] API not reachable, using local seed:", err);
  }

  return (
    <div className="space-y-5">
      <div className="border-b border-[var(--color-line)] pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-700">
          Catálogo
        </span>
        <h1 className="mt-1 font-display text-[26px] text-[var(--color-ink)]">Productos</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Añade, edita o retira productos. El toggle marca disponibilidad para el día actual.
        </p>
      </div>
      <AdminProductsList initialProducts={products} initialCategories={categories} />
    </div>
  );
}
