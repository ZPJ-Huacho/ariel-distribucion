"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, Percent } from "lucide-react";
import { useSettings } from "@/shared/providers/SettingsProvider";
import { getActiveTheme } from "@/shared/lib/themes";
import { buttonVariants } from "@/shared/components/atoms/button";
import { ScheduleDisplay } from "@/shared/components/organisms/ScheduleDisplay";
import { cn } from "@/shared/lib/utils";

export function PromoBanner() {
  const s = useSettings();
  const theme = getActiveTheme(s.theme);
  const hasSchedule = s.schedule && Object.keys(s.schedule).length > 0;
  if (!hasSchedule && !s.address) return null;

  return (
    <section
      aria-label="Información del negocio"
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(120deg, color-mix(in oklch, var(--primary) 14%, var(--card)) 0%, var(--card) 55%, color-mix(in oklch, var(--primary) 8%, var(--card)) 100%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 text-[10rem] opacity-10 select-none"
      >
        {theme.emoji}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 60%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative grid grid-cols-1 gap-6 p-6 sm:p-10 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Percent className="h-3 w-3" aria-hidden />
            Pedido directo
          </span>
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">
            Pide en minutos,{" "}
            <span className="text-primary">sin apps</span> ni comisiones.
          </h2>
          <div className="flex flex-col gap-2 pt-2 text-sm text-muted-foreground">
            {hasSchedule && (
              <div className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                  aria-hidden
                />
                <ScheduleDisplay
                  schedule={s.schedule}
                  variant="inline"
                  className="text-sm"
                />
              </div>
            )}
            {s.address && (
              <span className="inline-flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                  aria-hidden
                />
                {s.address}
              </span>
            )}
          </div>
        </div>
        <div className="flex md:justify-end">
          <Link
            href="#catalogo"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 rounded-full px-6 text-sm font-semibold shadow-lg shadow-primary/20",
            )}
          >
            Empezar pedido
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
