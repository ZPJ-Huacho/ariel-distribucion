import Link from "next/link";
import { desc, eq, gte } from "drizzle-orm";
import {
  ArrowRight,
  BellRing,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getDb, orders, products, categories } from "@/shared/lib/db";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { AdminPageHeader } from "../components/AdminPageHeader";
import {
  RevenueAreaChart,
  StatusDonut,
  TopProductsChart,
} from "../components/DashboardCharts";
import {
  buildDailySeries,
  buildStatusStats,
  buildTopProducts,
  sumOrders,
  sumRevenue,
} from "../../lib/aggregate";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  confirmed: "bg-blue-100 text-blue-800 ring-blue-200",
  preparing: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 ring-rose-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Nuevo",
  confirmed: "Confirmado",
  preparing: "Preparando",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const DAYS = 30;

export async function AdminDashboardView() {
  const db = getDb();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (DAYS - 1));
  since.setUTCHours(0, 0, 0, 0);

  const [pending, latestOrders, recentOrders, prods, cats] = await Promise.all([
    db.select({ id: orders.id }).from(orders).where(eq(orders.status, "pending")),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
    db.select().from(orders).where(gte(orders.createdAt, since)),
    db.select({ id: products.id }).from(products),
    db.select({ id: categories.id }).from(categories),
  ]);

  const daily = buildDailySeries(recentOrders, DAYS);
  const statusStats = buildStatusStats(recentOrders);
  const topProducts = buildTopProducts(recentOrders, 5);
  const totalRevenue = sumRevenue(daily);
  const totalOrders = sumOrders(daily);
  const avgTicket = totalOrders ? totalRevenue / totalOrders : 0;

  return (
    <>
      <AdminPageHeader
        icon={LayoutDashboard}
        eyebrow="Panel"
        title="Vista general"
        description="Últimos 30 días · métricas del negocio."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Pendientes"
          value={pending.length}
          icon={BellRing}
          accent
        />
        <StatCard
          label="Ingresos"
          value={formatPrice(totalRevenue)}
          icon={Wallet}
        />
        <StatCard label="Ticket medio" value={formatPrice(avgTicket)} icon={TrendingUp} />
        <StatCard label="Pedidos 30d" value={totalOrders} icon={ShoppingBag} />
      </div>

      <RevenueAreaChart points={daily} />

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusDonut stats={statusStats} />
        <TopProductsChart products={topProducts} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MiniStatCard label="Productos" value={prods.length} icon={Package} href="/admin/productos" />
        <MiniStatCard label="Categorías" value={cats.length} icon={Tag} href="/admin/categorias" />
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card shadow-sm">
        <header className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Últimos pedidos</h2>
              <p className="truncate text-xs text-muted-foreground">
                Los 5 más recientes.
              </p>
            </div>
          </div>
          <Link
            href="/admin/pedidos"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary sm:text-sm"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </header>

        {!latestOrders.length ? (
          <div className="mx-4 mb-4 flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground sm:mx-6 md:mx-8">
            <ShoppingBag className="h-8 w-8 opacity-40" aria-hidden />
            <p>Aún no hay pedidos.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {latestOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-4 md:px-8"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{o.code}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                        STATUS_STYLE[o.status] ??
                          "bg-muted text-muted-foreground ring-border",
                      )}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {o.customerName} · {o.customerPhone}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-primary sm:text-base">
                  {formatPrice(o.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-colors sm:p-5",
        accent
          ? "border-primary/40"
          : "border-border/60 bg-card hover:border-primary/30",
      )}
      style={
        accent
          ? {
              background: `linear-gradient(140deg,
                color-mix(in oklch, var(--primary) 18%, var(--card)) 0%,
                var(--card) 90%)`,
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
            accent
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {accent && typeof value === "number" && value > 0 && (
          <span
            aria-hidden
            className="grid h-2 w-2 place-items-center rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_30%,transparent)]"
          />
        )}
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-xl font-bold sm:text-2xl">{value}</p>
    </div>
  );
}

function MiniStatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-bold">{value}</p>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}
