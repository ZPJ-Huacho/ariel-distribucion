import { Tag } from "lucide-react";
import { AdminPageHeader } from "@/features/admin-dashboard/ui/components/AdminPageHeader";
import { AdminCategories } from "../components/AdminCategories";

export function AdminCategoriesView() {
  return (
    <>
      <AdminPageHeader
        icon={Tag}
        eyebrow="Catálogo"
        title="Categorías"
        description="Organiza los productos por sección."
      />
      <AdminCategories />
    </>
  );
}
