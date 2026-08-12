"use client";

import Link from "next/link";
import { useSettings } from "@/shared/providers/SettingsProvider";
import { SVG_ASSETS } from "@/shared/assets/svg";

export function AdminBrand() {
  const s = useSettings();

  return (
    <Link
      href="/admin"
      // `min-w-0` sí, `shrink-0` NO: el nav del medio necesita robarle
      // espacio al nombre si el viewport lo pide, y el nombre trunca.
      className="flex min-w-0 items-center gap-2 font-semibold sm:gap-2.5"
      aria-label={`${s.businessName} · Panel de administración`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.logoUrl || SVG_ASSETS.logoHorizontal}
        alt=""
        aria-hidden
        className="h-8 w-auto max-w-[110px] shrink-0 object-contain sm:h-9"
      />
      {/* Nombre + chip "Panel". El nombre solo aparece desde sm y siempre
          trunca. El chip "Panel" solo desde xl para no comerle espacio al nav
          en el rango problemático (lg 1024-1280 px). */}
      <span className="hidden min-w-0 items-center gap-2 xl:flex">
        <span className="truncate text-sm sm:text-base">
          {s.businessName || "Admin"}
        </span>
        <span className="hidden shrink-0 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 xl:inline">
          Panel
        </span>
      </span>
      {/* Fallback compacto para sm-lg: solo el nombre truncado, sin chip. */}
      <span className="hidden min-w-0 truncate text-sm sm:inline xl:hidden">
        {s.businessName || "Admin"}
      </span>
    </Link>
  );
}
