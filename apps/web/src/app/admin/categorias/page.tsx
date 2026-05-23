import { AdminCategoriesList } from "@/components/admin-categories-list";

export default function AdminCategorias() {
  return (
    <div className="space-y-5">
      <div className="border-b border-[var(--color-line)] pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-700">
          Catálogo
        </span>
        <h1 className="mt-1 font-display text-[26px] text-[var(--color-ink)]">
          Categorías
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Crea, renombra o retira categorías. Aparecen como secciones en el
          catálogo del cliente.
        </p>
      </div>
      <AdminCategoriesList />
    </div>
  );
}
