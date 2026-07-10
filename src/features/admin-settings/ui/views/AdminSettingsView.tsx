import { SlidersHorizontal } from "lucide-react";
import { AdminPageHeader } from "@/features/admin-dashboard/ui/components/AdminPageHeader";
import { AdminSettings } from "../components/AdminSettings";

export function AdminSettingsView() {
  return (
    <>
      <AdminPageHeader
        icon={SlidersHorizontal}
        eyebrow="Configuración"
        title="Ajustes del negocio"
        description="Nombre, contacto, horarios y temática."
      />
      <AdminSettings />
    </>
  );
}
