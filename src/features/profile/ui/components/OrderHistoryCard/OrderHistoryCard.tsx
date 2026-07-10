"use client";

import Link from "next/link";
import { PackageOpen, RefreshCw, ShoppingBag } from "lucide-react";
import type { OrderStatus } from "@/core/orders";
import { useMyOrders } from "../../../api/useMyOrders";
import { formatPrice } from "@/shared/lib/format";
import { buttonVariants } from "@/shared/components/atoms/button";
import { cn } from "@/shared/lib/utils";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Nuevo",
  confirmed: "Confirmado",
  preparing: "Preparando",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  confirmed: "bg-blue-100 text-blue-800 ring-blue-200",
  preparing: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 ring-rose-200",
};

export function OrderHistoryCard() {
  const { data: orders = [], isLoading, isError, refetch } = useMyOrders();

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PackageOpen className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Mis pedidos</h3>
            <p className="truncate text-xs text-muted-foreground">
              Últimos pedidos que has hecho registrado.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          aria-label="Recargar historial"
          className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </header>

      <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando historial...</p>
        ) : isError ? (
          <p className="text-sm text-destructive">
            No pudimos cargar tus pedidos.
          </p>
        ) : !orders.length ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            <ShoppingBag className="h-8 w-8 opacity-40" aria-hidden />
            <p>Todavía no has hecho ningún pedido.</p>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Ir al catálogo →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border bg-background p-3 transition-colors hover:border-primary/40 sm:p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{o.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                      STATUS_STYLE[o.status],
                    )}
                  >
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <ul className="mt-3 flex flex-col gap-0.5 text-xs text-muted-foreground">
                  {o.items.slice(0, 3).map((i, idx) => (
                    <li key={idx} className="truncate">
                      {i.quantity}× {i.name}
                    </li>
                  ))}
                  {o.items.length > 3 && (
                    <li className="italic">
                      + {o.items.length - 3} productos más...
                    </li>
                  )}
                </ul>
                <div className="mt-3 flex items-baseline justify-end gap-1 border-t pt-2">
                  <span className="text-xs text-muted-foreground">Total:</span>
                  <span className="text-sm font-semibold">
                    {formatPrice(o.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
