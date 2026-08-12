import { redirect } from "next/navigation";

// La gestión de usuarios ahora vive dentro de /admin/ajustes (sección
// "Equipo", al final). El hash #usuarios hace que el navegador salte
// directamente ahí. Mantiene bookmarks y links antiguos apuntando a
// /admin/usuarios funcionando.
export default function AdminUsuariosPage() {
  redirect("/admin/ajustes#usuarios");
}
