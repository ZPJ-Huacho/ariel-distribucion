"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const DAILY_LIMIT = 15;

export function AIUsageCard({
  enabled,
  used,
  onToggle,
}: {
  enabled: boolean;
  used: number;
  onToggle: (v: boolean) => void;
}) {
  const pct = Math.min(100, Math.round((used / DAILY_LIMIT) * 100));
  const state: "ok" | "warn" | "danger" =
    used >= DAILY_LIMIT ? "danger" : used >= DAILY_LIMIT * 0.85 ? "warn" : "ok";

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors",
          enabled
            ? "border-primary/40 bg-primary/5"
            : "border-border/60 hover:border-primary/30",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
              enabled
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Generación con IA</p>
            <p className="text-xs text-muted-foreground">
              {enabled
                ? "Activada · usa el botón desde cada producto"
                : "Desactivada · el botón no aparecerá al crear productos"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
            enabled ? "bg-primary" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
              enabled ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </span>
      </button>

      {enabled && (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 p-3 sm:p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Uso hoy
            </span>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                state === "danger"
                  ? "text-destructive"
                  : state === "warn"
                    ? "text-amber-600"
                    : "text-primary",
              )}
            >
              {used} / {DAILY_LIMIT}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <span
              className={cn(
                "block h-full rounded-full transition-all",
                state === "danger"
                  ? "bg-destructive"
                  : state === "warn"
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-primary/70 to-primary",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {state === "danger"
              ? "Has llegado al límite de hoy. Se resetea a medianoche."
              : state === "warn"
                ? "Estás cerca del límite. Se resetea a medianoche."
                : "Se resetea automáticamente cada día a medianoche."}
          </p>
        </div>
      )}
    </div>
  );
}
