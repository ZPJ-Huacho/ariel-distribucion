"use client";

import { useState } from "react";
import type { DemoOrder } from "@/lib/data/types";
import { formatPrice, formatRelativeTime, getSourceMeta } from "@/lib/format";
import { useOrders } from "@/lib/orders-store";
import { tenant } from "@/lib/data/tenant";

function buildConfirmMessage(order: DemoOrder): string {
  const itemsLine = order.items
    .map((i) => `• ${i.quantity}× ${i.name} (${i.unit})`)
    .join("\n");
  const time = order.preferredTime ?? "lo antes posible";
  return [
    `Buenos días ${order.customerName.split(" ")[0]},`,
    `${tenant.name} le confirma el pedido ${order.id}:`,
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

const statusOptions: { value: DemoOrder["status"]; label: string; tone: string }[] = [
  { value: "pending", label: "Pendiente", tone: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "confirmed", label: "Confirmado", tone: "bg-sky-100 text-sky-800 border-sky-300" },
  { value: "preparing", label: "Preparando", tone: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { value: "delivered", label: "Entregado", tone: "bg-brand-100 text-brand-800 border-brand-300" },
];

const statusMeta = Object.fromEntries(statusOptions.map((s) => [s.value, s])) as Record<
  DemoOrder["status"],
  (typeof statusOptions)[number]
>;

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19.05 4.91A9.92 9.92 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.93 9.93 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02zm-2.49 11.24c-.21.58-1.21 1.11-1.67 1.18-.42.06-.95.08-1.53-.1-.35-.11-.8-.26-1.38-.51-2.42-1.05-4.01-3.5-4.13-3.66-.12-.16-.99-1.32-.99-2.52s.63-1.78.85-2.03c.22-.25.49-.31.65-.31h.48c.15.01.36-.06.56.43.2.5.7 1.72.76 1.84.06.12.1.27.02.43-.09.16-.13.27-.25.41-.13.14-.27.32-.38.43-.13.13-.25.27-.11.51.15.25.64 1.06 1.38 1.72.95.84 1.75 1.1 2 1.23.25.12.4.1.54-.06.15-.16.63-.72.79-.97.17-.25.32-.21.56-.12.22.09 1.44.69 1.69.81.25.12.41.18.47.28.06.11.06.6-.15 1.18z" />
  </svg>
);

export function AdminOrdersList({ orders: demoOrders }: { orders: DemoOrder[] }) {
  const userOrders = useOrders((s) => s.orders);
  const setStoreStatus = useOrders((s) => s.setStatus);
  const [demoState, setDemoState] = useState(demoOrders);
  const [openId, setOpenId] = useState<string | null>(null);

  const orders = [...userOrders, ...demoState];

  function setStatus(id: string, status: DemoOrder["status"]) {
    if (userOrders.some((o) => o.id === id)) {
      setStoreStatus(id, status);
    } else {
      setDemoState((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  }

  function handleConfirm(o: DemoOrder) {
    if (o.status === "pending") setStatus(o.id, "confirmed");
  }

  return (
    <ul className="space-y-2">
      {orders.map((o) => {
        const meta = getSourceMeta(o.source);
        const stMeta = statusMeta[o.status];
        const isOpen = openId === o.id;
        const showQuickConfirm = o.status === "pending" || o.status === "confirmed";
        return (
          <li
            key={o.id}
            className="overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]"
          >
            <div className="flex items-stretch">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : o.id)}
                className="flex flex-1 items-center gap-3 p-3 text-left active:bg-[var(--color-canvas-soft)]"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-[10px] font-semibold uppercase tracking-wide ${meta.tone}`}>
                  {meta.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 truncate font-display text-[14px] text-[var(--color-ink)]">
                      {o.customerName}
                      {o.isNew && (
                        <span className="shrink-0 animate-pulse rounded-sm bg-rose-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                          Nuevo
                        </span>
                      )}
                    </span>
                    <span className={`shrink-0 rounded-sm border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${stMeta.tone}`}>
                      {stMeta.label}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-[var(--color-ink-mute)]">
                    <span className="truncate">
                      {o.items.length} producto{o.items.length === 1 ? "" : "s"} · {formatRelativeTime(o.createdAt)}
                    </span>
                    <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                      {formatPrice(o.total)}
                    </span>
                  </div>
                </div>
              </button>
              {showQuickConfirm && (
                <a
                  href={whatsappLink(o.customerPhone, buildConfirmMessage(o))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleConfirm(o)}
                  aria-label="Confirmar por WhatsApp"
                  title="Confirmar por WhatsApp"
                  className="flex shrink-0 items-center justify-center border-l border-[var(--color-line)] bg-emerald-800 px-4 text-emerald-50 hover:bg-emerald-900 active:scale-95"
                >
                  <WhatsAppIcon />
                </a>
              )}
            </div>
            {isOpen && (
              <div className="border-t border-[var(--color-line)] bg-[var(--color-canvas-soft)] p-3 text-sm">
                <div className="space-y-1">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-[var(--color-ink-soft)]">
                      <span>
                        {i.quantity}× {i.name}{" "}
                        <span className="text-[var(--color-ink-mute)]">({i.unit})</span>
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatPrice(i.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 border-t border-[var(--color-line)] pt-3 text-[12px] text-[var(--color-ink-soft)]">
                  <div className="flex gap-2">
                    <span className="text-[var(--color-ink-mute)]">Tel.</span>
                    <span>{o.customerPhone}</span>
                  </div>
                  {o.customerAddress && (
                    <div className="flex gap-2">
                      <span className="text-[var(--color-ink-mute)]">Dirección</span>
                      <span>{o.customerAddress}</span>
                    </div>
                  )}
                  {o.preferredTime && (
                    <div className="flex gap-2">
                      <span className="text-[var(--color-ink-mute)]">Hora</span>
                      <span>{o.preferredTime}</span>
                    </div>
                  )}
                  {o.notes && (
                    <div className="flex gap-2">
                      <span className="text-[var(--color-ink-mute)]">Notas</span>
                      <span>{o.notes}</span>
                    </div>
                  )}
                </div>
                <a
                  href={whatsappLink(o.customerPhone, buildConfirmMessage(o))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleConfirm(o)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-emerald-900 bg-emerald-800 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-50 hover:bg-emerald-900 active:scale-[0.997]"
                >
                  <WhatsAppIcon />
                  Confirmar por WhatsApp
                </a>
                <div className="mt-4">
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-mute)]">
                    Estado
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(o.id, opt.value)}
                        className={`rounded-sm border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
                          o.status === opt.value
                            ? opt.tone
                            : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
