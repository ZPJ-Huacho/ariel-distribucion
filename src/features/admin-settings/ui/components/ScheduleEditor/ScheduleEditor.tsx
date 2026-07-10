"use client";

import { Copy } from "lucide-react";
import {
  DAY_KEYS,
  DAY_LABELS,
  type DayKey,
  type WeekSchedule,
} from "@/core/settings";
import { Input } from "@/shared/components/atoms/input";
import { cn } from "@/shared/lib/utils";

export function ScheduleEditor({
  value,
  onChange,
}: {
  value: WeekSchedule;
  onChange: (v: WeekSchedule) => void;
}) {
  function setDay<K extends keyof WeekSchedule[DayKey]>(
    day: DayKey,
    key: K,
    val: WeekSchedule[DayKey][K],
  ) {
    onChange({ ...value, [day]: { ...value[day], [key]: val } });
  }

  function applyToAll(day: DayKey) {
    const source = value[day];
    const next: WeekSchedule = { ...value };
    for (const key of DAY_KEYS) next[key] = { ...source };
    onChange(next);
  }

  function applyToWeekdays(day: DayKey) {
    const source = value[day];
    const next: WeekSchedule = { ...value };
    for (const key of ["mon", "tue", "wed", "thu", "fri"] as DayKey[]) {
      next[key] = { ...source };
    }
    onChange(next);
  }

  return (
    <ul className="flex flex-col gap-2">
      {DAY_KEYS.map((day) => {
        const d = value[day];
        return (
          <li
            key={day}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center sm:gap-3",
              d.closed
                ? "border-border/40 bg-muted/30"
                : "border-border/60 bg-background",
            )}
          >
            <div className="flex items-center gap-3 sm:w-32 sm:shrink-0">
              <button
                type="button"
                onClick={() => setDay(day, "closed", !d.closed)}
                role="switch"
                aria-checked={!d.closed}
                aria-label={`${DAY_LABELS[day]}: ${d.closed ? "cerrado" : "abierto"}`}
                className="inline-flex items-center gap-2"
              >
                <span
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                    !d.closed ? "bg-emerald-500" : "bg-muted-foreground/30",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                      !d.closed ? "translate-x-4" : "translate-x-0.5",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    d.closed ? "text-muted-foreground" : "",
                  )}
                >
                  {DAY_LABELS[day]}
                </span>
              </button>
            </div>

            {d.closed ? (
              <span className="text-xs text-muted-foreground sm:flex-1">
                Cerrado
              </span>
            ) : (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  type="time"
                  value={d.open}
                  onChange={(e) => setDay(day, "open", e.target.value)}
                  className="h-9 flex-1 tabular-nums"
                  aria-label={`Apertura ${DAY_LABELS[day]}`}
                />
                <span className="text-xs text-muted-foreground">a</span>
                <Input
                  type="time"
                  value={d.close}
                  onChange={(e) => setDay(day, "close", e.target.value)}
                  className="h-9 flex-1 tabular-nums"
                  aria-label={`Cierre ${DAY_LABELS[day]}`}
                />
              </div>
            )}

            <div className="flex items-center gap-1 sm:shrink-0">
              <button
                type="button"
                onClick={() => applyToWeekdays(day)}
                aria-label={`Aplicar el horario del ${DAY_LABELS[day]} a los días laborables`}
                title="Copiar a lunes-viernes"
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Copy className="h-3 w-3" aria-hidden />
                L–V
              </button>
              <button
                type="button"
                onClick={() => applyToAll(day)}
                aria-label={`Aplicar el horario del ${DAY_LABELS[day]} a todos los días`}
                title="Copiar a toda la semana"
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Copy className="h-3 w-3" aria-hidden />
                Todo
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
