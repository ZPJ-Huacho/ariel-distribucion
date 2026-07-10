"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayPoint } from "../../../lib/aggregate";
import { formatPrice } from "@/shared/lib/format";

function formatShortDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatFullDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DayPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold capitalize">{formatFullDate(p.date)}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Ingresos</span>
        <span className="font-bold text-primary">{formatPrice(p.revenue)}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Pedidos</span>
        <span className="font-semibold tabular-nums">{p.orders}</span>
      </div>
    </div>
  );
}

export function RevenueAreaChart({ points }: { points: DayPoint[] }) {
  const total = points.reduce((n, p) => n + p.revenue, 0);
  const orderCount = points.reduce((n, p) => n + p.orders, 0);
  const nonZero = points.some((p) => p.revenue > 0);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Últimos 30 días
          </p>
          <h2 className="text-base font-semibold">Ingresos</h2>
          <p className="text-2xl font-bold text-primary sm:text-3xl">
            {formatPrice(total)}
          </p>
          <p className="text-xs text-muted-foreground">
            {orderCount} {orderCount === 1 ? "pedido" : "pedidos"} en el periodo
          </p>
        </div>
      </header>

      {!nonZero ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
          Aún no hay ingresos registrados.
        </div>
      ) : (
        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 6"
                stroke="var(--border)"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                content={<TooltipContent />}
                cursor={{
                  stroke: "var(--primary)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#revGradient)"
                activeDot={{
                  r: 5,
                  stroke: "var(--background)",
                  strokeWidth: 2,
                  fill: "var(--primary)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
