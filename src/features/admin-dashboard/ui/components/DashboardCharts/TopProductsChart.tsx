"use client";

import { Package2 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopProduct } from "../../../lib/aggregate";
import { formatPrice } from "@/shared/lib/format";

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TopProduct }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold">{p.name}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Unidades</span>
        <span className="font-bold">{p.quantity}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Ingresos</span>
        <span className="font-bold text-primary">{formatPrice(p.revenue)}</span>
      </div>
    </div>
  );
}

export function TopProductsChart({ products }: { products: TopProduct[] }) {
  const data = products.map((p) => ({
    ...p,
    short: p.name.length > 22 ? `${p.name.slice(0, 22)}…` : p.name,
  }));
  const height = Math.max(180, data.length * 42);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Package2 className="h-4 w-4" aria-hidden />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Ranking
          </p>
          <h2 className="text-base font-semibold">Productos más pedidos</h2>
        </div>
      </div>

      {!products.length ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
          Sin pedidos todavía.
        </div>
      ) : (
        <div className="w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
              barCategoryGap="30%"
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={1}
                  />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="short"
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                content={<TooltipContent />}
                cursor={{ fill: "var(--muted)", opacity: 0.35 }}
              />
              <Bar
                dataKey="quantity"
                radius={[999, 999, 999, 999]}
                fill="url(#barGradient)"
                label={{
                  position: "right",
                  fill: "var(--foreground)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {data.map((p) => (
                  <Cell key={p.name} fill="url(#barGradient)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
