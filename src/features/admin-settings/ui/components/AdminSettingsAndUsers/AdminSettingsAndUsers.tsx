import { SlidersHorizontal, Users as UsersIcon } from "lucide-react";
import { AdminPageHeader } from "@/features/admin-dashboard/ui/components/AdminPageHeader";
import { AdminUsers } from "@/features/admin-users/ui/components/AdminUsers";
import { AdminSettings } from "../AdminSettings";

// Layout de la página /admin/ajustes: primero los ajustes del negocio
// (uso diario), y al final la gestión de usuarios como bloque separado.
// Un ancla #usuarios permite saltar directo desde /admin/usuarios o desde
// un link externo.
export function AdminSettingsAndUsers() {
  return (
    <>
      <AdminPageHeader
        icon={SlidersHorizontal}
        eyebrow="Configuración"
        title="Ajustes del negocio"
        description="Nombre, contacto, horarios, temática y equipo."
      />

      <AdminSettings />

      <section
        id="usuarios"
        aria-labelledby="team-heading"
        className="mt-4 flex scroll-mt-24 flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6"
      >
        <header className="flex items-center gap-3 border-b pb-4">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25"
          >
            <UsersIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
              Equipo
            </p>
            <h2 id="team-heading" className="text-base font-semibold sm:text-lg">
              Gestión de usuarios
            </h2>
            <p className="text-xs text-muted-foreground">
              Consulta los usuarios registrados y ajusta sus permisos.
            </p>
          </div>
        </header>

        <AdminUsers />
      </section>
    </>
  );
}
