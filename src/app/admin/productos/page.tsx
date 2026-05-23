import { AdminProductsList } from "@/components/admin-products-list";

export default function AdminProductos() {
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
      <AdminProductsList />
    </div>
  );
}
