import { Users } from "lucide-react";
import { AdminPageHeader } from "@/features/admin-dashboard/ui/components/AdminPageHeader";
import { AdminUsers } from "../components/AdminUsers";

export function AdminUsersView() {
  return (
    <>
      <AdminPageHeader
        icon={Users}
        eyebrow="Equipo"
        title="Usuarios"
        description="Consulta los usuarios registrados y ajusta sus permisos."
      />
      <AdminUsers />
    </>
  );
}
