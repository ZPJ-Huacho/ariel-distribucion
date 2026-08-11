"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  Calendar,
  Check,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  MessageCircle,
  NotebookPen,
  Search,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Order, OrderStatus } from "@/core/orders";
import { useOrders, useUpdateOrderStatus } from "../../../api/useOrders";
import { buildConfirmationLink } from "../../lib/whatsapp-message";
import { Input } from "@/shared/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type FilterStatus = OrderStatus | "all";

type StatusMeta = {
  id: OrderStatus;
  label: string;
  dot: string;
  /** Fondo + texto para la pastilla y el trigger del Select. */
  chip: string;
  icon: LucideIcon;
};

const STATUSES: StatusMeta[] = [
  {
    id: "pending",
    label: "Nuevo",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    icon: ShoppingCart,
  },
  {
    id: "confirmed",
    label: "Confirmado",
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Check,
  },
  {
    id: "preparing",
    label: "Preparando",
    dot: "bg-indigo-500",
    chip: "bg-indigo-50 text-indigo-800 border-indigo-200",
    icon: ChefHat,
  },
  {
    id: "delivered",
    label: "Entregado",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: Truck,
  },
  {
    id: "cancelled",
    label: "Cancelado",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    icon: Ban,
  },
];

const SORT_PRIORITY: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  delivered: 3,
  cancelled: 4,
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function statusMeta(status: OrderStatus): StatusMeta {
  return STATUSES.find((s) => s.id === status) ?? STATUSES[0];
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - then) / 60_000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD} d`;
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function AdminOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const update = useUpdateOrderStatus();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<FilterStatus, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) map[o.status] += 1;
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    let result = orders.slice();
    if (filter !== "all") result = result.filter((o) => o.status === filter);
    const q = normalize(query.trim());
    if (q) {
      result = result.filter(
        (o) =>
          normalize(o.code).includes(q) ||
          normalize(o.customerName).includes(q) ||
          normalize(o.customerPhone).includes(q),
      );
    }
    return result.sort((a, b) => {
      const p = SORT_PRIORITY[a.status] - SORT_PRIORITY[b.status];
      if (p !== 0) return p;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, filter, query]);

  async function setStatus(id: string, status: OrderStatus) {
    setPendingId(id);
    try {
      await update.mutateAsync({ id, status });
      toast.success("Estado actualizado");
    } catch {
      toast.error("No pudimos actualizar");
    } finally {
      setPendingId(null);
    }
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Cargando pedidos…
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
            placeholder="Buscar por código, cliente o teléfono…"
            aria-label="Buscar pedidos"
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
          {STATUSES.map((s) => (
            <FilterChip
              key={s.id}
              active={filter === s.id}
              onClick={() => setFilter(s.id)}
              count={counts[s.id]}
              dotColor={s.dot}
            >
              {s.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
          <ShoppingCart className="h-8 w-8 opacity-40" aria-hidden />
          <p>
            {orders.length === 0
              ? "Aún no hay pedidos."
              : "No hay resultados con estos filtros."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="hidden border-b bg-muted/40 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:table-header-group">
              <tr>
                <th className="px-3 py-2.5 text-left">Estado</th>
                <th className="px-3 py-2.5 text-left">Pedido</th>
                <th className="px-3 py-2.5 text-left">Cliente</th>
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right">Recibido</th>
                <th className="px-3 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((o) => (
                <OrderRow
                  key={o.id}
                  order={o}
                  expanded={expanded.has(o.id)}
                  onToggle={() => toggleExpanded(o.id)}
                  onStatus={(s) => setStatus(o.id, s)}
                  pending={pendingId === o.id}
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

function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: OrderStatus;
  disabled: boolean;
  onChange: (s: OrderStatus) => void;
}) {
  const meta = statusMeta(value);
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as OrderStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-8 w-[150px] gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=open]:ring-2 data-[state=open]:ring-primary/30",
          meta.chip,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" className="min-w-[180px]">
        {STATUSES.filter((s) => s.id !== "cancelled").map((s) => (
          <SelectItem key={s.id} value={s.id} className="gap-2 text-xs">
            <span
              aria-hidden
              className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)}
            />
            {s.label}
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem
          value="cancelled"
          className="gap-2 text-xs text-rose-600 focus:bg-rose-50 focus:text-rose-700 dark:focus:bg-rose-500/10"
        >
          <Ban className="h-3 w-3" aria-hidden />
          Cancelar
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
  onStatus,
  pending,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: OrderStatus) => void;
  pending: boolean;
}) {
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const closed = order.status === "delivered" || order.status === "cancelled";

  return (
    <>
      <tr
        className={cn(
          "grid grid-cols-2 gap-x-3 gap-y-2 p-3 transition-colors hover:bg-muted/30 md:table-row md:gap-0 md:p-0",
          closed && "opacity-80",
        )}
      >
        {/* Estado */}
        <td className="order-1 md:table-cell md:px-3 md:py-2.5">
          <StatusSelect
            value={order.status}
            disabled={pending}
            onChange={onStatus}
          />
        </td>

        {/* Pedido (código + hora móvil) */}
        <td className="order-3 col-span-2 min-w-0 md:table-cell md:px-3 md:py-2.5">
          <p
            className={cn(
              "truncate text-sm font-semibold",
              order.status === "cancelled" && "line-through opacity-70",
            )}
          >
            {order.code}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {itemCount} {itemCount === 1 ? "unidad" : "uds"}
          </p>
        </td>

        {/* Cliente */}
        <td className="order-4 col-span-2 min-w-0 md:table-cell md:px-3 md:py-2.5">
          <p className="truncate text-sm">{order.customerName}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {order.customerPhone}
          </p>
        </td>

        {/* Total */}
        <td className="order-2 self-start text-right md:table-cell md:px-3 md:py-2.5">
          <p className="text-base font-bold text-primary tabular-nums">
            {formatPrice(order.total)}
          </p>
        </td>

        {/* Recibido (solo desktop, integrado en móvil abajo) */}
        <td className="hidden md:table-cell md:px-3 md:py-2.5 md:text-right">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden />
            {relativeTime(order.createdAt)}
          </span>
        </td>

        {/* Acciones */}
        <td className="order-5 col-span-2 md:table-cell md:px-3 md:py-2.5 md:text-right">
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className="mr-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground md:hidden">
              <Clock className="h-3 w-3" aria-hidden />
              {relativeTime(order.createdAt)}
            </span>
            {order.status !== "cancelled" && (
              <a
                href={buildConfirmationLink(order)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Escribir por WhatsApp"
                title="Escribir por WhatsApp"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden lg:inline">WhatsApp</span>
              </a>
            )}
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-controls={`order-${order.id}-details`}
              aria-label={expanded ? "Ocultar detalles" : "Ver detalles"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr id={`order-${order.id}-details`} className="bg-muted/30">
          <td colSpan={6} className="p-3 sm:p-5">
            <OrderDetails order={order} />
          </td>
        </tr>
      )}
    </>
  );
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {order.customerAddress && (
          <DetailRow
            icon={MapPin}
            label="Dirección"
            value={order.customerAddress}
          />
        )}
        {order.preferredTime && (
          <DetailRow
            icon={Clock}
            label="Horario preferido"
            value={order.preferredTime}
          />
        )}
        <DetailRow
          icon={Calendar}
          label="Recibido"
          value={new Date(order.createdAt).toLocaleString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      </div>

      {order.notes && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <NotebookPen className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p className="italic">{order.notes}</p>
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <header className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Productos
        </header>
        <ul className="divide-y">
          {order.items.map((i, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="truncate">
                <span className="font-semibold text-primary">{i.quantity}×</span>{" "}
                {i.name}{" "}
                <span className="text-xs text-muted-foreground">({i.unit})</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatPrice(i.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <footer className="flex items-center justify-between border-t px-3 py-2 text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="text-base font-bold text-primary">
            {formatPrice(order.total)}
          </span>
        </footer>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border bg-card p-2.5">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}
