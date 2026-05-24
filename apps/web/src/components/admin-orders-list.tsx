"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MessageCircle } from "lucide-react";
import { ApiError } from "@mercabana/core";
import type { AdminOrder, OrderStatus } from "@mercabana/core";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatRelativeTime, getSourceMeta } from "@/lib/format";
import { createBrowserApiClient } from "@/lib/api";
import { useToast } from "@/lib/toast-store";
import { tenant } from "@/lib/data/tenant";
import { cn } from "@/lib/utils";

function buildConfirmMessage(order: AdminOrder): string {
  const itemsLine = order.items
    .map((i) => `• ${i.quantity}× ${i.name} (${i.unit})`)
    .join("\n");
  const time = order.preferredTime ?? "lo antes posible";
  return [
    `Buenos días ${order.customerName.split(" ")[0]},`,
    `${tenant.name} le confirma el pedido ${order.code}:`,
    "",
    itemsLine,
    "",
    `Total: ${formatPrice(order.total)} (pago a la entrega)`,
    `Entrega prevista: ${time.toLowerCase()}.`,
    "",
    "Gracias por su confianza.",
  ].join("\n");
}

function whatsappLink(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

const statusOptions: { value: OrderStatus; label: string; tone: string }[] = [
  {
    value: "pending",
    label: "Pendiente",
    tone: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    value: "confirmed",
    label: "Confirmado",
    tone: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    value: "preparing",
    label: "Preparando",
    tone: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    value: "delivered",
    label: "Entregado",
    tone: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

const statusMeta = Object.fromEntries(statusOptions.map((s) => [s.value, s])) as Record<
  OrderStatus,
  (typeof statusOptions)[number]
>;

export function AdminOrdersList({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const showToast = useToast((s) => s.show);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    try {
      await createBrowserApiClient().admin.orders.updateStatus(id, status);
      router.refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? `Error ${err.status}` : "Sin conexión";
      showToast(`No se pudo actualizar (${msg})`);
    } finally {
      setBusyId(null);
    }
  }

  function handleConfirm(o: AdminOrder) {
    if (o.status === "pending") setStatus(o.id, "confirmed");
  }

  if (orders.length === 0) {
    return (
      <Card className="border-dashed py-14 text-center">
        <CardContent>
          <p className="text-[13.5px] text-muted-foreground">
            No hay pedidos aún. Los nuevos aparecerán aquí en cuanto los recibas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-2">
      {orders.map((o) => {
        const meta = getSourceMeta(o.source);
        const status = o.status === "cancelled" ? "delivered" : o.status;
        const stMeta = statusMeta[status];
        const isOpen = openId === o.id;
        const showQuickConfirm = status === "pending" || status === "confirmed";
        return (
          <li key={o.id}>
            <Card className="overflow-hidden p-0">
              <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : o.id)}
                  className="flex flex-1 items-center gap-3 p-3 text-left transition hover:bg-muted/40"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10.5px] font-semibold uppercase tracking-wide",
                      meta.tone,
                    )}
                  >
                    {meta.initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-foreground">
                        {o.customerName}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 rounded-full border", stMeta.tone)}
                      >
                        {stMeta.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2 text-[11.5px] text-muted-foreground">
                      <span className="truncate">
                        {o.code} · {o.items.length} producto
                        {o.items.length === 1 ? "" : "s"} ·{" "}
                        {formatRelativeTime(o.createdAt)}
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                        {formatPrice(o.total)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {showQuickConfirm && (
                  <a
                    href={whatsappLink(o.customerPhone, buildConfirmMessage(o))}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleConfirm(o)}
                    aria-label="Confirmar por WhatsApp"
                    title="Confirmar por WhatsApp"
                    className="flex shrink-0 items-center justify-center border-l border-border bg-emerald-600 px-4 text-emerald-50 transition hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
              {isOpen && (
                <div className="border-t border-border bg-muted/30 p-4 text-[13px]">
                  <ul className="space-y-1.5">
                    {o.items.map((i, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between text-muted-foreground"
                      >
                        <span>
                          {i.quantity}× {i.name}{" "}
                          <span className="text-foreground/60">({i.unit})</span>
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatPrice(i.price * i.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-3" />
                  <dl className="grid grid-cols-[80px_1fr] gap-y-1 text-[12px]">
                    <dt className="text-muted-foreground">Tel.</dt>
                    <dd className="text-foreground">{o.customerPhone}</dd>
                    {o.customerAddress && (
                      <>
                        <dt className="text-muted-foreground">Dirección</dt>
                        <dd className="text-foreground">{o.customerAddress}</dd>
                      </>
                    )}
                    {o.preferredTime && (
                      <>
                        <dt className="text-muted-foreground">Hora</dt>
                        <dd className="text-foreground">{o.preferredTime}</dd>
                      </>
                    )}
                    {o.notes && (
                      <>
                        <dt className="text-muted-foreground">Notas</dt>
                        <dd className="text-foreground">{o.notes}</dd>
                      </>
                    )}
                  </dl>
                  <a
                    href={whatsappLink(o.customerPhone, buildConfirmMessage(o))}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleConfirm(o)}
                    className={cn(
                      buttonVariants({}),
                      "mt-3 w-full bg-emerald-600 hover:bg-emerald-700",
                    )}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Confirmar por WhatsApp
                  </a>
                  <div className="mt-4">
                    <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Estado
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {statusOptions.map((opt) => (
                        <Button
                          key={opt.value}
                          type="button"
                          variant={status === opt.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatus(o.id, opt.value)}
                          disabled={busyId === o.id}
                          className={cn(
                            "rounded-full",
                            status === opt.value && opt.tone,
                          )}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
