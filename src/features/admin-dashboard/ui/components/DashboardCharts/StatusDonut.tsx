"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusKey, StatusStat } from "../../../lib/aggregate";

const STATUS_META: Record<StatusKey, { label: string; color: string }> = {
  pending: { label: "Nuevos", color: "#f59e0b" },
  confirmed: { label: "Confirmados", color: "#3b82f6" },
  preparing: { label: "Preparando", color: "#6366f1" },
  delivered: { label: "Entregados", color: "#10b981" },
  cancelled: { label: "Cancelados", color: "#f43f5e" },
};

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: StatusStat & { label: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{p.label}</p>
      <p className="text-muted-foreground">
        <span className="font-bold text-foreground">{p.count}</span>{" "}
        {p.count === 1 ? "pedido" : "pedidos"}
      </p>
    </div>
  );
}

export function StatusDonut({ stats }: { stats: StatusStat[] }) {
  const total = stats.reduce((n, s) => n + s.count, 0);
  const data = stats
    .filter((s) => s.count > 0)
    .map((s) => ({
      ...s,
      label: STATUS_META[s.status].label,
      color: STATUS_META[s.status].color,
    }));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Estado
        </p>
        <h2 className="text-base font-semibold">Pedidos por estado</h2>
      </div>

      {total === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
          Sin datos todavía.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold leading-none">{total}</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Pedidos
              </span>
            </div>
          </div>

          <ul className="flex w-full min-w-0 flex-1 flex-col gap-2">
            {stats.map((s) => {
              const meta = STATUS_META[s.status];
              const share = total ? Math.round((s.count / total) * 100) : 0;
              return (
                <li key={s.status} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: meta.color }}
                  />
                  <span className="flex-1 truncate">{meta.label}</span>
                  <span className="font-semibold tabular-nums">{s.count}</span>
                  <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {share}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
