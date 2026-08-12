import { redirect } from "next/navigation";

// La gestión de usuarios ahora vive como pestaña dentro de /admin/ajustes.
// Este redirect mantiene vivos bookmarks, links viejos y cualquier JS
// cacheado que aún apunte a /admin/usuarios.
export default function AdminUsuariosPage() {
  redirect("/admin/ajustes?tab=users");
}
