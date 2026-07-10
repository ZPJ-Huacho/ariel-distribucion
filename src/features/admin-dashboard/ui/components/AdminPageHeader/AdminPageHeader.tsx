import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function AdminPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/15 p-3.5 shadow-sm sm:p-6 md:p-7",
        className,
      )}
      style={{
        background: `radial-gradient(120% 100% at 0% 0%,
          color-mix(in oklch, var(--primary) 12%, var(--card)) 0%,
          var(--card) 70%)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 60%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 sm:h-11 sm:w-11 md:h-12 md:w-12"
          >
            <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </span>
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
