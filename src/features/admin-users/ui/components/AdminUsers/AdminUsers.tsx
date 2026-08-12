"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Crown,
  Mail,
  Phone,
  Search,
  Shield,
  User as UserIcon,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/core/shared";
import { isAdmin } from "@/core/shared";
import type { User } from "@/core/users";
import { useCurrentUser } from "@/shared/providers/UserProvider";
import { Input } from "@/shared/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import { toUiMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import { useUpdateUserRole, useUsers } from "../../../api/useUsers";

type FilterRole = Role | "all";

type RoleMeta = {
  id: Role;
  label: string;
  dot: string;
  chip: string;
  icon: LucideIcon;
};

const ROLES: RoleMeta[] = [
  {
    id: "super_admin",
    label: "Super admin",
    dot: "bg-fuchsia-500",
    chip: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
    icon: Crown,
  },
  {
    id: "admin",
    label: "Admin",
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Shield,
  },
  {
    id: "customer",
    label: "Cliente",
    dot: "bg-slate-400",
    chip: "bg-slate-100 text-slate-700 border-slate-200",
    icon: UserIcon,
  },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function roleMeta(role: Role): RoleMeta {
  return ROLES.find((r) => r.id === role) ?? ROLES[2];
}

// Espeja las reglas del backend para deshabilitar el Select antes de mandar
// la request (evita el 403 y da mejor UX). El servidor sigue siendo el que
// las hace cumplir.
function assignableRoles(viewerRole: Role, targetRole: Role): Role[] {
  if (viewerRole === "super_admin") return ["super_admin", "admin", "customer"];
  if (targetRole === "super_admin") return [];
  return ["admin", "customer"];
}

export function AdminUsers() {
  const me = useCurrentUser();
  const { data: users = [], isLoading, error } = useUsers();
  const update = useUpdateUserRole();

  const [filter, setFilter] = useState<FilterRole>("all");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const viewerRole: Role = me?.role ?? "customer";
  const isSuper = viewerRole === "super_admin";

  // El admin (no super) no ve el filtro de super_admin (no le llegarán filas
  // igualmente, pero limpia la UI).
  const visibleRoles = isSuper ? ROLES : ROLES.filter((r) => r.id !== "super_admin");

  const counts = useMemo(() => {
    const map: Record<FilterRole, number> = {
      all: users.length,
      super_admin: 0,
      admin: 0,
      customer: 0,
    };
    for (const u of users) map[u.role] += 1;
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    let result = users.slice();
    if (filter !== "all") result = result.filter((u) => u.role === filter);
    const q = normalize(query.trim());
    if (q) {
      result = result.filter(
        (u) =>
          normalize(u.name).includes(q) ||
          normalize(u.email).includes(q) ||
          (u.phone && normalize(u.phone).includes(q)),
      );
    }
    return result;
  }, [users, filter, query]);

  async function setRole(id: string, role: Role) {
    setPendingId(id);
    try {
      await update.mutateAsync({ id, role });
      toast.success("Rol actualizado");
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos actualizar el rol"));
    } finally {
      setPendingId(null);
    }
  }

  if (!me || !isAdmin(me.role)) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        No tienes permisos para ver esta sección.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Cargando usuarios…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive shadow-sm">
        No pudimos cargar los usuarios.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono…"
            aria-label="Buscar usuarios"
            className="h-10 pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={counts.all}
          >
            Todos
          </FilterChip>
          {visibleRoles.map((r) => (
            <FilterChip
              key={r.id}
              active={filter === r.id}
              onClick={() => setFilter(r.id)}
              count={counts[r.id]}
              dotColor={r.dot}
            >
              {r.label}
            </FilterChip>
          ))}
        </div>

        {!isSuper && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            Como <strong>Admin</strong> ves clientes y otros admins. Los
            <em> super_admin</em> quedan fuera de tu alcance.
          </p>
        )}
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
          <UserIcon className="h-8 w-8 opacity-40" aria-hidden />
          <p>
            {users.length === 0
              ? "Aún no hay usuarios."
              : "No hay resultados con estos filtros."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="hidden border-b bg-muted/40 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:table-header-group">
              <tr>
                <th className="px-3 py-2.5 text-left">Usuario</th>
                <th className="px-3 py-2.5 text-left">Teléfono</th>
                <th className="px-3 py-2.5 text-left">Rol</th>
                <th className="px-3 py-2.5 text-right">Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isSelf={me.id === u.id}
                  viewerRole={viewerRole}
                  pending={pendingId === u.id}
                  onRole={(r) => setRole(u.id, r)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  count,
  dotColor,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  dotColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
      )}
    >
      {dotColor && (
        <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
      )}
      {children}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
          active ? "bg-white/20" : "bg-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function UserRow({
  user,
  isSelf,
  viewerRole,
  pending,
  onRole,
}: {
  user: User;
  isSelf: boolean;
  viewerRole: Role;
  pending: boolean;
  onRole: (r: Role) => void;
}) {
  const allowed = assignableRoles(viewerRole, user.role);
  const locked = isSelf || allowed.length === 0;
  const created = new Date(user.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="grid grid-cols-2 gap-x-3 gap-y-2 p-3 transition-colors hover:bg-muted/30 md:table-row md:gap-0 md:p-0">
      {/* Usuario */}
      <td className="col-span-2 min-w-0 md:table-cell md:px-3 md:py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          {isSelf && (
            <span className="inline-flex shrink-0 items-center rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
              Tú
            </span>
          )}
        </div>
        <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
          <Mail className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{user.email}</span>
        </p>
      </td>

      {/* Teléfono */}
      <td className="min-w-0 md:table-cell md:px-3 md:py-2.5">
        {user.phone ? (
          <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" aria-hidden />
            {user.phone}
          </p>
        ) : (
          <p className="text-xs italic text-muted-foreground/60">—</p>
        )}
      </td>

      {/* Rol */}
      <td className="md:table-cell md:px-3 md:py-2.5">
        <RoleSelect
          value={user.role}
          allowed={allowed}
          disabled={pending || locked}
          onChange={onRole}
          lockedReason={
            isSelf
              ? "No puedes cambiar tu propio rol"
              : allowed.length === 0
                ? "Fuera de tu alcance"
                : undefined
          }
        />
      </td>

      {/* Registrado */}
      <td className="col-span-2 text-right text-[11px] text-muted-foreground md:table-cell md:px-3 md:py-2.5">
        <span className="md:hidden">Registrado: </span>
        {created}
      </td>
    </tr>
  );
}

function RoleSelect({
  value,
  allowed,
  disabled,
  onChange,
  lockedReason,
}: {
  value: Role;
  allowed: Role[];
  disabled: boolean;
  onChange: (r: Role) => void;
  lockedReason?: string;
}) {
  const meta = roleMeta(value);
  if (disabled) {
    return (
      <span
        title={lockedReason}
        className={cn(
          "inline-flex h-8 w-[140px] cursor-not-allowed items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold opacity-70",
          meta.chip,
        )}
      >
        <meta.icon className="h-3.5 w-3.5" aria-hidden />
        {meta.label}
      </span>
    );
  }
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Role)}>
      <SelectTrigger
        className={cn(
          "h-8 w-[140px] gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=open]:ring-2 data-[state=open]:ring-primary/30",
          meta.chip,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" className="min-w-[180px]">
        {allowed.map((id) => {
          const m = roleMeta(id);
          return (
            <SelectItem key={id} value={id} className="gap-2 text-xs">
              <span
                aria-hidden
                className={cn("h-2 w-2 shrink-0 rounded-full", m.dot)}
              />
              {m.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
