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
  MoreHorizontal,
  NotebookPen,
  Package,
  Phone,
  RotateCcw,
  Search,
  ShoppingCart,
  Truck,
  User as UserIcon,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Order, OrderStatus } from "@/core/orders";
import { useOrders, useUpdateOrderStatus } from "../../../api/useOrders";
import { buildConfirmationLink } from "../../lib/whatsapp-message";
import { Input } from "@/shared/components/atoms/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/atoms/dropdown-menu";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type FilterStatus = OrderStatus | "all";

type StatusMeta = {
  id: OrderStatus;
  label: string;
  chip: string;
  dot: string;
  strip: string;
  icon: LucideIcon;
  /** Orden en el flujo happy-path. cancelled queda fuera. */
  step: number | null;
};

const STATUSES: StatusMeta[] = [
  {
    id: "pending",
    label: "Nuevo",
    chip: "bg-amber-100 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    strip: "bg-amber-500",
    icon: ShoppingCart,
    step: 0,
  },
  {
    id: "confirmed",
    label: "Confirmado",
    chip: "bg-blue-100 text-blue-800 ring-blue-200",
    dot: "bg-blue-500",
    strip: "bg-blue-500",
    icon: Check,
    step: 1,
  },
  {
    id: "preparing",
    label: "Preparando",
    chip: "bg-indigo-100 text-indigo-800 ring-indigo-200",
    dot: "bg-indigo-500",
    strip: "bg-indigo-500",
    icon: ChefHat,
    step: 2,
  },
  {
    id: "delivered",
    label: "Entregado",
    chip: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
    strip: "bg-emerald-500",
    icon: Truck,
    step: 3,
  },
  {
    id: "cancelled",
    label: "Cancelado",
    chip: "bg-rose-100 text-rose-800 ring-rose-200",
    dot: "bg-rose-500",
    strip: "bg-rose-500",
    icon: Ban,
    step: null,
  },
];

const HAPPY_PATH = STATUSES.filter((s) => s.step !== null).sort(
  (a, b) => (a.step as number) - (b.step as number),
);

// Orden en la lista: primero lo accionable (nuevos), al final lo cerrado.
const SORT_PRIORITY: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  delivered: 3,
  cancelled: 4,
};

const NEXT_ACTION: Partial<
  Record<OrderStatus, { to: OrderStatus; label: string; icon: LucideIcon }>
> = {
  pending: { to: "confirmed", label: "Confirmar", icon: Check },
  confirmed: { to: "preparing", label: "Empezar a preparar", icon: ChefHat },
  preparing: { to: "delivered", label: "Marcar como entregado", icon: Truck },
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
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `hace ${diffD} d`;
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function itemsPreview(order: Order): string {
  const shown = order.items.slice(0, 2).map((i) => `${i.quantity}× ${i.name}`);
  const rest = order.items.length - shown.length;
  return rest > 0 ? `${shown.join(", ")} · +${rest} más` : shown.join(", ");
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
        <ul className="flex flex-col gap-3 sm:gap-4">
          {filtered.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              expanded={expanded.has(o.id)}
              onToggle={() => toggleExpanded(o.id)}
              onStatus={(s) => setStatus(o.id, s)}
              pending={pendingId === o.id}
            />
          ))}
        </ul>
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

function OrderCard({
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
  const meta = statusMeta(order.status);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const next = NEXT_ACTION[order.status];
  const closed = order.status === "delivered" || order.status === "cancelled";

  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors hover:border-primary/30",
        closed && "opacity-90",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", meta.strip)}
      />

      <div className="flex flex-col gap-3 p-3 pl-4 sm:p-5 sm:pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className={cn(
                "truncate text-sm font-semibold sm:text-base",
                order.status === "cancelled" && "line-through opacity-70",
              )}
            >
              {order.code}
            </p>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                meta.chip,
              )}
            >
              <meta.icon className="h-3 w-3" aria-hidden />
              {meta.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden />
              {relativeTime(order.createdAt)}
            </span>
          </div>
          <p className="shrink-0 text-base font-bold text-primary sm:text-lg">
            {formatPrice(order.total)}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-sm">
            <span className="font-medium">{order.customerName}</span>
            <span className="text-muted-foreground"> · {order.customerPhone}</span>
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Package className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">
              <span className="font-medium text-foreground/80">
                {itemCount} {itemCount === 1 ? "unidad" : "uds"}
              </span>{" "}
              <span aria-hidden>·</span> {itemsPreview(order)}
            </span>
          </p>
        </div>

        <StatusProgress current={order.status} />

        <div className="flex flex-wrap items-center gap-2">
          {next ? (
            <button
              type="button"
              onClick={() => onStatus(next.to)}
              disabled={pending}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              <next.icon className="h-3.5 w-3.5" aria-hidden />
              {next.label}
            </button>
          ) : (
            <span
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground sm:flex-none",
              )}
            >
              <meta.icon className="h-3.5 w-3.5" aria-hidden />
              {order.status === "delivered"
                ? "Pedido cerrado"
                : "Pedido cancelado"}
            </span>
          )}

          {order.status !== "cancelled" && (
            <a
              href={buildConfirmationLink(order)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir por WhatsApp"
              title="Escribir por WhatsApp"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          <MoreMenu
            currentStatus={order.status}
            disabled={pending}
            onStatus={onStatus}
          />

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={`order-${order.id}-details`}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            {expanded ? "Cerrar" : "Ver detalles"}
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          id={`order-${order.id}-details`}
          className="flex flex-col gap-3 border-t bg-muted/30 p-3 sm:gap-4 sm:p-5"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <DetailRow icon={UserIcon} label="Cliente" value={order.customerName} />
            <DetailRow icon={Phone} label="Teléfono" value={order.customerPhone} />
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
                    <span className="font-semibold text-primary">
                      {i.quantity}×
                    </span>{" "}
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
      )}
    </li>
  );
}

function StatusProgress({ current }: { current: OrderStatus }) {
  if (current === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-medium text-rose-700">
        <Ban className="h-3 w-3" aria-hidden />
        Pedido cancelado — no continúa en el flujo.
      </div>
    );
  }
  const currentStep =
    HAPPY_PATH.find((s) => s.id === current)?.step ?? 0;

  return (
    <ol className="flex items-center gap-1" aria-label="Progreso del pedido">
      {HAPPY_PATH.map((s, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        const upcoming = idx > currentStep;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                "flex min-w-0 flex-1 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium transition-colors",
                done && "border-emerald-200 bg-emerald-50 text-emerald-700",
                active && "border-primary bg-primary text-primary-foreground shadow-sm",
                upcoming && "border-border/50 bg-background text-muted-foreground/70",
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold",
                  done && "bg-emerald-500 text-white",
                  active && "bg-white/25 text-white",
                  upcoming && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-2.5 w-2.5" aria-hidden /> : idx + 1}
              </span>
              <span className="truncate">{s.label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function MoreMenu({
  currentStatus,
  disabled,
  onStatus,
}: {
  currentStatus: OrderStatus;
  disabled: boolean;
  onStatus: (s: OrderStatus) => void;
}) {
  // Cambios de estado dentro del flujo (excluye current y cancel). El "cancel"
  // va al final, aislado, para que no se toque sin querer.
  const flowOptions = HAPPY_PATH.filter((s) => s.id !== currentStatus);
  const reopening = currentStatus === "cancelled";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label="Más acciones"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {reopening ? "Reabrir como" : "Cambiar estado a"}
          </DropdownMenuLabel>
          {flowOptions.map((s) => {
            const Icon = reopening ? RotateCcw : s.icon;
            return (
              <DropdownMenuItem
                key={s.id}
                onSelect={() => onStatus(s.id)}
                className="gap-2"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {s.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        {!reopening && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => onStatus("cancelled")}
                className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700 dark:focus:bg-rose-500/10"
              >
                <Ban className="h-3.5 w-3.5" aria-hidden />
                Cancelar pedido
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
