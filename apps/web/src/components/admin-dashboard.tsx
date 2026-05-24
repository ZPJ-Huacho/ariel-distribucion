import Link from "next/link";
import {
  ArrowRight,
  ChartBar,
  CircleCheck,
  Clock4,
  EuroIcon,
  Package,
  Receipt,
} from "lucide-react";
import type { AdminOrder, Product } from "@mercabana/core";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatRelativeTime, getSourceMeta } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AdminDashboard({
  orders,
  products,
}: {
  orders: AdminOrder[];
  products: Product[];
}) {
  const pending = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed",
  );
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const ordersBySource = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.source] = (acc[o.source] ?? 0) + 1;
    return acc;
  }, {});
  const sources = Object.entries(ordersBySource).sort((a, b) => b[1] - a[1]);
  const productCount = products.filter((p) => p.isAvailable).length;
  const tiktokPct = orders.length
    ? Math.round(((ordersBySource.tiktok ?? 0) / orders.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Resumen del día
        </p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-foreground">
          Operación de hoy
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<Receipt className="h-4 w-4" />}
          label="Pedidos"
          value={orders.length.toString()}
        />
        <Stat
          icon={<Clock4 className="h-4 w-4" />}
          label="Por atender"
          value={pending.length.toString()}
          accent={pending.length > 0 ? "amber" : "default"}
        />
        <Stat
          icon={<EuroIcon className="h-4 w-4" />}
          label="Facturación"
          value={formatPrice(revenue)}
        />
        <Stat
          icon={<Package className="h-4 w-4" />}
          label="Productos activos"
          value={productCount.toString()}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[14.5px]">
              <ChartBar className="h-4 w-4 text-muted-foreground" />
              Pedidos por canal
              <Badge variant="secondary" className="ml-auto rounded-full text-[10.5px]">
                Hoy
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-muted-foreground">
                Sin pedidos aún.
              </p>
            ) : (
              <ul className="space-y-4">
                {sources.map(([src, n]) => {
                  const meta = getSourceMeta(src);
                  const pct = Math.round((n / orders.length) * 100);
                  return (
                    <li key={src} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-[10.5px] font-semibold uppercase tracking-wide",
                          meta.tone,
                        )}
                      >
                        {meta.initial}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[12.5px]">
                          <span className="font-medium text-foreground">
                            {meta.label}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {n} · {pct}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {tiktokPct > 0 && (
              <p className="mt-5 border-t border-border pt-4 text-[12px] text-muted-foreground">
                TikTok genera el{" "}
                <span className="font-semibold text-foreground">
                  {tiktokPct}%
                </span>{" "}
                de los pedidos del día.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[14.5px]">
              <span className="flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-muted-foreground" />
                Por atender
              </span>
              <Link
                href="/admin/pedidos"
                className="inline-flex items-center gap-0.5 text-[11.5px] font-medium text-primary hover:underline"
              >
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pending.slice(0, 3).map((o) => {
                const meta = getSourceMeta(o.source);
                return (
                  <li
                    key={o.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-[10.5px] font-semibold uppercase tracking-wide",
                        meta.tone,
                      )}
                    >
                      {meta.initial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-semibold text-foreground">
                          {o.customerName}
                        </span>
                        <span className="shrink-0 text-[10.5px] text-muted-foreground">
                          {o.code}
                        </span>
                      </div>
                      <p className="truncate text-[11.5px] text-muted-foreground">
                        {o.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
                      </p>
                      <span className="text-[10.5px] text-muted-foreground">
                        {formatRelativeTime(o.createdAt)}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums text-foreground">
                      {formatPrice(o.total)}
                    </span>
                  </li>
                );
              })}
              {pending.length === 0 && (
                <li className="rounded-lg border border-dashed border-border p-6 text-center text-[12.5px] text-muted-foreground">
                  Sin pedidos por atender.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "default" | "amber";
}) {
  return (
    <Card className="gap-1.5 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            accent === "amber"
              ? "bg-amber-100 text-amber-700"
              : "bg-muted text-foreground",
          )}
        >
          {icon}
        </span>
        <span className="text-[11.5px] font-medium uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-[24px] font-semibold tabular-nums tracking-tight",
          accent === "amber" ? "text-amber-700" : "text-foreground",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
