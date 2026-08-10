export type Role = "super_admin" | "admin" | "customer";

// `super_admin` cuenta como admin a todos los efectos (proxy, guards, UI).
// El único fin del rol separado es distinguirlo visualmente y dejar espacio
// a futuro para permisos exclusivos (ej. gestión de otros admins).
export function isAdmin(role: Role | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  image: string | null;
  provider: "credentials" | "google";
};

export type Session = { user: SessionUser } | null;
