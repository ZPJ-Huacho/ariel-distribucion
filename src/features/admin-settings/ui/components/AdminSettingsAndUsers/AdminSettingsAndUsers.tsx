"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Users as UsersIcon } from "lucide-react";
import { AdminPageHeader } from "@/features/admin-dashboard/ui/components/AdminPageHeader";
import { AdminUsers } from "@/features/admin-users/ui/components/AdminUsers";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/atoms/tabs";
import { AdminSettings } from "../AdminSettings";

type Tab = "settings" | "users";

const HEADER: Record<Tab, { title: string; description: string; icon: typeof SlidersHorizontal }> = {
  settings: {
    title: "Ajustes del negocio",
    description: "Nombre, contacto, horarios y temática.",
    icon: SlidersHorizontal,
  },
  users: {
    title: "Usuarios",
    description: "Consulta los usuarios registrados y ajusta sus permisos.",
    icon: UsersIcon,
  },
};

export function AdminSettingsAndUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab: Tab = searchParams.get("tab") === "users" ? "users" : "settings";
  const meta = HEADER[tab];

  const setTab = useCallback(
    (next: string) => {
      const value: Tab = next === "users" ? "users" : "settings";
      const params = new URLSearchParams(searchParams);
      if (value === "users") params.set("tab", "users");
      else params.delete("tab");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <>
      <AdminPageHeader
        icon={meta.icon}
        eyebrow="Configuración"
        title={meta.title}
        description={meta.description}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="settings" className="gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Ajustes
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <UsersIcon className="h-3.5 w-3.5" aria-hidden />
            Usuarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          <AdminSettings />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <AdminUsers />
        </TabsContent>
      </Tabs>
    </>
  );
}
