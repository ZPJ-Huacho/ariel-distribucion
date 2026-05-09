"use client";

import { useState } from "react";
import type { DemoOrder } from "@/lib/data/types";
import { formatPrice, formatRelativeTime, getSourceMeta } from "@/lib/format";
import { useOrders } from "@/lib/orders-store";

const statusOptions: { value: DemoOrder["status"]; label: string; tone: string }[] = [
  { value: "pending", label: "Pendiente", tone: "bg-amber-100 text-amber-700" },
  { value: "confirmed", label: "Confirmado", tone: "bg-sky-100 text-sky-700" },
  { value: "preparing", label: "Preparando", tone: "bg-indigo-100 text-indigo-700" },
  { value: "delivered", label: "Entregado", tone: "bg-emerald-100 text-emerald-700" },
];

const statusMeta = Object.fromEntries(statusOptions.map((s) => [s.value, s])) as Record<
  DemoOrder["status"],
  (typeof statusOptions)[number]
>;

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

  return (
    <ul className="space-y-2">
      {orders.map((o) => {
        const meta = getSourceMeta(o.source);
        const stMeta = statusMeta[o.status];
        const isOpen = openId === o.id;
        return (
          <li key={o.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : o.id)}
              className="flex w-full items-center gap-3 p-3 text-left active:bg-stone-50"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                {meta.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-stone-900">
                    {o.customerName}
                    {o.isNew && (
                      <span className="shrink-0 animate-pulse rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                        Nuevo
                      </span>
                    )}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${stMeta.tone}`}>
                    {stMeta.label}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-stone-500">
                  <span className="truncate">
                    {o.items.length} producto{o.items.length === 1 ? "" : "s"} · {formatRelativeTime(o.createdAt)}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-stone-900">{formatPrice(o.total)}</span>
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-stone-100 bg-stone-50 p-3 text-sm">
                <div className="space-y-1">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-stone-700">
                      <span>{i.quantity}× {i.name} <span className="text-stone-400">({i.unit})</span></span>
                      <span className="font-medium">{formatPrice(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 border-t border-stone-200 pt-3 text-[12px] text-stone-600">
                  <div>📞 {o.customerPhone}</div>
                  {o.notes && <div>📝 {o.notes}</div>}
                </div>
                <div className="mt-3">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-stone-500">
                    Cambiar estado
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(o.id, opt.value)}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                          o.status === opt.value
                            ? `${opt.tone} ring-2 ring-offset-1 ring-current/30`
                            : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"
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
