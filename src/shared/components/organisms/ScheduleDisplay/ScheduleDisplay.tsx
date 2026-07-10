import {
  formatDayRange,
  formatHours,
  groupSchedule,
  type WeekSchedule,
} from "@/core/settings";
import { cn } from "@/shared/lib/utils";

export function ScheduleDisplay({
  schedule,
  variant = "list",
  className,
}: {
  schedule: WeekSchedule;
  variant?: "list" | "inline";
  className?: string;
}) {
  const groups = groupSchedule(schedule);

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex flex-wrap gap-x-3 gap-y-1", className)}>
        {groups.map((g, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex items-baseline gap-1.5 tabular-nums",
              g.hours.closed && "text-muted-foreground/70",
            )}
          >
            <span className="font-medium">{formatDayRange(g.days)}</span>
            <span>{formatHours(g.hours)}</span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-1.5 text-sm", className)}>
      {groups.map((g, i) => (
        <li
          key={i}
          className={cn(
            "flex items-baseline justify-between gap-3 tabular-nums",
            g.hours.closed && "text-muted-foreground/70",
          )}
        >
          <span className="font-medium">{formatDayRange(g.days)}</span>
          <span>{formatHours(g.hours)}</span>
        </li>
      ))}
    </ul>
  );
}
