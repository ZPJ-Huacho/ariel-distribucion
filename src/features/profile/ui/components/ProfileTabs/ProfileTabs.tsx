"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { KeyRound, PackageOpen, Truck, UserRound } from "lucide-react";
import type { User } from "@/core/users";
import { cn } from "@/shared/lib/utils";
import { PersonalInfoCard } from "../PersonalInfoCard";
import { DeliveryPrefsCard } from "../DeliveryPrefsCard";
import { SecurityCard } from "../SecurityCard";
import { OrderHistoryCard } from "../OrderHistoryCard";

const SECTIONS = [
  { id: "personal", label: "Datos", fullLabel: "Datos personales", Icon: UserRound },
  { id: "delivery", label: "Entrega", fullLabel: "Entrega", Icon: Truck },
  { id: "security", label: "Seguridad", fullLabel: "Seguridad", Icon: KeyRound },
  { id: "orders", label: "Pedidos", fullLabel: "Mis pedidos", Icon: PackageOpen },
] as const;

type TabId = (typeof SECTIONS)[number]["id"];
const VALID_TABS = new Set<string>(SECTIONS.map((s) => s.id));

function readTab(value: string | null): TabId {
  return value && VALID_TABS.has(value) ? (value as TabId) : "personal";
}

export function ProfileTabs({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<TabId>(() => readTab(searchParams.get("tab")));

  useEffect(() => {
    setTab(readTab(searchParams.get("tab")));
  }, [searchParams]);

  const changeTab = (next: TabId) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "personal") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="md:sticky md:top-6 md:self-start">
        <nav
          aria-label="Secciones del perfil"
          className="grid grid-cols-4 gap-1 rounded-2xl border bg-card p-1.5 shadow-sm md:flex md:flex-col md:gap-1 md:p-2"
        >
          {SECTIONS.map(({ id, label, fullLabel, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => changeTab(id)}
                aria-current={active ? "page" : undefined}
                aria-label={fullLabel}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-[11px] font-medium transition-all",
                  "md:flex-row md:justify-start md:gap-2 md:px-3 md:text-sm",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap md:hidden">{label}</span>
                <span className="hidden whitespace-nowrap md:inline">
                  {fullLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="min-w-0">
        {tab === "personal" && <PersonalInfoCard user={user} />}
        {tab === "delivery" && <DeliveryPrefsCard user={user} />}
        {tab === "security" && <SecurityCard />}
        {tab === "orders" && <OrderHistoryCard />}
      </section>
    </div>
  );
}
