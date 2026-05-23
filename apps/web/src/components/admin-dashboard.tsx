"use client";

import Link from "next/link";
import { useOrders } from "@/lib/orders-store";
import { products } from "@/lib/data/products";
import { formatPrice, formatRelativeTime, getSourceMeta } from "@/lib/format";
import type { DemoOrder } from "@mercabana/core";

export function AdminDashboard({ demoOrders }: { demoOrders: DemoOrder[] }) {
  const userOrders = useOrders((s) => s.orders);
  const today = [...userOrders, ...demoOrders];

  const pending = today.filter((o) => o.status === "pending" || o.status === "confirmed");
  const revenue = today.reduce((sum, o) => sum + o.total, 0);
  const ordersBySource = today.reduce<Record<string, number>>((acc, o) => {
    acc[o.source] = (acc[o.source] ?? 0) + 1;
    return acc;
  }, {});
  const sources = Object.entries(ordersBySource).sort((a, b) => b[1] - a[1]);
  const productCount = products.filter((p) => p.isAvailable).length;
  const tiktokPct = today.length
    ? Math.round(((ordersBySource.tiktok ?? 0) / today.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-line)] pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-700">
          Resumen del día
        </span>
        <h1 className="mt-1 font-display text-[26px] text-[var(--color-ink)]">
          Operación del día
        </h1>
      </div>

      {userOrders.length > 0 && (
        <div className="flex items-center justify-between rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm">
          <span className="font-semibold text-rose-800">
            {userOrders.length} pedido{userOrders.length === 1 ? "" : "s"} nuevo{userOrders.length === 1 ? "" : "s"} pendientes
          </span>
          <Link
            href="/admin/pedidos"
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-900 underline"
          >
            Revisar →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Pedidos" value={today.length.toString()} />
        <Stat
          label="Por atender"
          value={pending.length.toString()}
          accent={pending.length > 0 ? "text-amber-700" : undefined}
        />
        <Stat label="Facturación" value={formatPrice(revenue)} />
        <Stat label="Productos activos" value={productCount.toString()} />
      </div>

      <section className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
            Pedidos por canal
          </h2>
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-ink-mute)]">
            Hoy
          </span>
        </div>
        <ul className="space-y-3">
          {sources.map(([src, n]) => {
            const meta = getSourceMeta(src);
            const pct = Math.round((n / today.length) * 100);
            return (
              <li key={src} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-sm text-[10px] font-semibold uppercase tracking-wide ${meta.tone}`}
                >
                  {meta.initial}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-[var(--color-ink)]">{meta.label}</span>
                    <span className="text-[var(--color-ink-mute)] tabular-nums">
                      {n} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-sm bg-[var(--color-canvas-soft)]">
                    <div className="h-full bg-brand-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {tiktokPct > 0 && (
          <p className="mt-4 border-t border-[var(--color-line)] pt-3 text-[11px] text-[var(--color-ink-soft)]">
            TikTok genera el <span className="font-semibold text-[var(--color-ink)]">{tiktokPct}%</span> de los pedidos del día.
          </p>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
            Por atender
          </h2>
          <Link
            href="/admin/pedidos"
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-800 hover:text-brand-900"
          >
            Ver todos →
          </Link>
        </div>
        <ul className="space-y-2">
          {pending.slice(0, 3).map((o) => {
            const meta = getSourceMeta(o.source);
            return (
              <li
                key={o.id}
                className="flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-3"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-sm text-[10px] font-semibold uppercase tracking-wide ${meta.tone}`}>
                  {meta.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[14px] text-[var(--color-ink)]">
                      {o.customerName}
                    </span>
                    {o.isNew && (
                      <span className="rounded-sm bg-rose-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                        Nuevo
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--color-ink-mute)]">
                      {formatRelativeTime(o.createdAt)}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-[var(--color-ink-mute)]">
                    {o.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
                  </p>
                </div>
                <span className="font-display text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                  {formatPrice(o.total)}
                </span>
              </li>
            );
          })}
          {pending.length === 0 && (
            <li className="rounded-md border border-dashed border-[var(--color-line)] p-6 text-center text-sm text-[var(--color-ink-mute)]">
              Sin pedidos por atender.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-mute)]">
        {label}
      </span>
      <p className={`mt-2 font-display text-2xl font-semibold tabular-nums ${accent ?? "text-[var(--color-ink)]"}`}>
        {value}
      </p>
    </div>
  );
}
