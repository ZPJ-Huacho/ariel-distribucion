import Link from "next/link";
import { demoOrders } from "@/lib/data/demo-orders";
import { products } from "@/lib/data/products";
import { formatPrice, formatRelativeTime, getSourceMeta } from "@/lib/format";

export default function AdminDashboard() {
  const today = demoOrders;
  const pending = today.filter((o) => o.status === "pending" || o.status === "confirmed");
  const revenue = today.reduce((sum, o) => sum + o.total, 0);
  const ordersBySource = today.reduce<Record<string, number>>((acc, o) => {
    acc[o.source] = (acc[o.source] ?? 0) + 1;
    return acc;
  }, {});
  const sources = Object.entries(ordersBySource).sort((a, b) => b[1] - a[1]);
  const productCount = products.filter((p) => p.isAvailable).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Hoy</h1>
        <p className="text-sm text-stone-500">Resumen rápido del día</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Pedidos hoy"
          value={today.length.toString()}
          accent="text-brand-700"
          emoji="📦"
        />
        <Stat
          label="Por atender"
          value={pending.length.toString()}
          accent={pending.length > 0 ? "text-amber-600" : "text-stone-700"}
          emoji="⏰"
        />
        <Stat
          label="Facturación"
          value={formatPrice(revenue)}
          accent="text-emerald-700"
          emoji="💶"
        />
        <Stat
          label="Productos en venta"
          value={productCount.toString()}
          accent="text-stone-700"
          emoji="🥬"
        />
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Pedidos por fuente</h2>
          <span className="text-[11px] text-stone-500">Hoy</span>
        </div>
        <ul className="space-y-2">
          {sources.map(([src, n]) => {
            const meta = getSourceMeta(src);
            const pct = Math.round((n / today.length) * 100);
            return (
              <li key={src} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.tone} text-sm`}>
                  {meta.emoji}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-800">{meta.label}</span>
                    <span className="text-stone-500">{n} pedido{n === 1 ? "" : "s"} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-[11px] text-stone-600">
          💡 TikTok te trae el {Math.round((ordersBySource.tiktok ?? 0) / today.length * 100)}% de los pedidos de hoy.
        </p>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-stone-900">Por atender</h2>
          <Link href="/admin/pedidos" className="text-xs font-medium text-brand-700 hover:underline">
            Ver todos →
          </Link>
        </div>
        <ul className="space-y-2">
          {pending.slice(0, 3).map((o) => {
            const meta = getSourceMeta(o.source);
            return (
              <li key={o.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.tone}`}>
                  {meta.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-900">{o.customerName}</span>
                    <span className="text-[10px] text-stone-400">{formatRelativeTime(o.createdAt)}</span>
                  </div>
                  <p className="truncate text-xs text-stone-500">
                    {o.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
                  </p>
                </div>
                <span className="text-sm font-bold text-stone-900">{formatPrice(o.total)}</span>
              </li>
            );
          })}
          {pending.length === 0 && (
            <li className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
              Sin pedidos por atender. ¡Bien!
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, accent, emoji }: { label: string; value: string; accent: string; emoji: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>{emoji}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-stone-500">{label}</span>
      </div>
      <p className={`mt-1.5 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
