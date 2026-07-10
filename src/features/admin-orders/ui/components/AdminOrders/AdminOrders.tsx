"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  MessageCircle,
  NotebookPen,
  Phone,
  Search,
  ShoppingCart,
  User as UserIcon,
  X,
} from "lucide-react";
import type { Order, OrderStatus } from "@/core/orders";
import { useOrders, useUpdateOrderStatus } from "../../../api/useOrders";
import { buildConfirmationLink } from "../../lib/whatsapp-message";
import { Input } from "@/shared/components/atoms/input";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type FilterStatus = OrderStatus | "all";

const STATUSES: {
  id: OrderStatus;
  label: string;
  chip: string;
  dot: string;
}[] = [
  {
    id: "pending",
    label: "Nuevo",
    chip: "bg-amber-100 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  {
    id: "confirmed",
    label: "Confirmado",
    chip: "bg-blue-100 text-blue-800 ring-blue-200",
    dot: "bg-blue-500",
  },
  {
    id: "preparing",
    label: "Preparando",
    chip: "bg-indigo-100 text-indigo-800 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    id: "delivered",
    label: "Entregado",
    chip: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    id: "cancelled",
    label: "Cancelado",
    chip: "bg-rose-100 text-rose-800 ring-rose-200",
    dot: "bg-rose-500",
  },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function statusMeta(status: OrderStatus) {
  return STATUSES.find((s) => s.id === status) ?? STATUSES[0];
}

export function AdminOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const update = useUpdateOrderStatus();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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
      result = result.filter((o) => {
        return (
          normalize(o.code).includes(q) ||
          normalize(o.customerName).includes(q) ||
          normalize(o.customerPhone).includes(q)
        );
      });
    }
    return result;
  }, [orders, filter, query]);

  async function setStatus(id: string, status: OrderStatus) {
    try {
      await update.mutateAsync({ id, status });
      toast.success("Estado actualizado");
    } catch {
      toast.error("No pudimos actualizar");
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
              pending={update.isPending}
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
        <span
          aria-hidden
          className={cn("h-1.5 w-1.5 rounded-full", dotColor)}
        />
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
  const created = new Date(order.createdAt);

  return (
    <li className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors hover:border-primary/30">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`order-${order.id}-details`}
        className="flex w-full items-start gap-3 p-3 text-left sm:gap-4 sm:p-5"
      >
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary sm:h-10 sm:w-10",
          )}
        >
          <ShoppingCart className="h-4 w-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate text-sm font-semibold sm:text-base">
                {order.code}
              </p>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                  meta.chip,
                )}
              >
                {meta.label}
              </span>
            </div>
            <p className="shrink-0 text-base font-bold text-primary sm:text-lg">
              {formatPrice(order.total)}
            </p>
          </div>

          <p className="truncate text-sm">
            <span className="font-medium">{order.customerName}</span>
            <span className="text-muted-foreground">
              {" "}
              · {order.customerPhone}
            </span>
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" aria-hidden />
                {itemCount} {itemCount === 1 ? "unidad" : "unidades"}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden />
                {created.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
              {expanded ? "Cerrar" : "Ver"}
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
              )}
            </span>
          </div>
        </div>
      </button>

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
                    <span className="text-xs text-muted-foreground">
                      ({i.unit})
                    </span>
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

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Cambiar estado
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {STATUSES.map((s) => {
                const active = order.status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onStatus(s.id)}
                    disabled={pending || active}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-70",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        active ? "bg-white" : s.dot,
                      )}
                    />
                    {s.label}
                  </button>
                );
              })}
              <a
                href={buildConfirmationLink(order)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </li>
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
