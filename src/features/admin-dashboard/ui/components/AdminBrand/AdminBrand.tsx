"use client";

import Link from "next/link";
import { useSettings } from "@/shared/providers/SettingsProvider";
import { SVG_ASSETS } from "@/shared/assets/svg";

export function AdminBrand() {
  const s = useSettings();

  return (
    <Link
      href="/admin"
      className="flex min-w-0 shrink-0 items-center gap-2 font-semibold sm:gap-2.5"
      aria-label={`${s.businessName} · Panel de administración`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.logoUrl || SVG_ASSETS.logoHorizontal}
        alt=""
        aria-hidden
        className="h-9 w-auto max-w-[130px] shrink-0 object-contain"
      />
      <span className="flex min-w-0 flex-col leading-tight lg:flex-row lg:items-center lg:gap-2">
        <span className="truncate text-sm sm:text-base">
          {s.businessName || "Admin"}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/50 lg:hidden">
          Panel
        </span>
        <span className="hidden rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 lg:inline">
          Panel
        </span>
      </span>
    </Link>
  );
}
