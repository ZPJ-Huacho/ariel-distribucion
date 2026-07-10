import { Package } from "lucide-react";
import { AdminPageHeader } from "@/features/admin-dashboard/ui/components/AdminPageHeader";
import { AdminProducts } from "../components/AdminProducts";

export function AdminProductsView() {
  return (
    <>
      <AdminPageHeader
        icon={Package}
        eyebrow="Catálogo"
        title="Productos"
        description="Añade, edita y organiza los productos disponibles."
      />
      <AdminProducts />
    </>
  );
}
