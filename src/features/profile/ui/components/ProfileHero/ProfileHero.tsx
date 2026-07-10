import { Shield } from "lucide-react";
import type { User } from "@/core/users";

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

export function ProfileHero({ user }: { user: User }) {
  const memberSince = new Date(user.createdAt).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 60%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-3 p-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:p-6 sm:text-left md:p-8">
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-md ring-4 ring-primary/10 sm:h-20 sm:w-20 sm:text-2xl"
        >
          {initialsOf(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="break-words text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
              {user.name}
            </h2>
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary sm:text-xs">
                <Shield className="h-3 w-3" aria-hidden />
                Admin
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
            {user.email}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">
            Miembro desde <span className="font-medium">{memberSince}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
