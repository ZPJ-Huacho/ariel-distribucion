"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createBrowserApiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useToast } from "@/lib/toast-store";

export function UserMenu() {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const router = useRouter();
  const showToast = useToast((s) => s.show);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!hydrated) return null;
  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden rounded-md border border-[var(--color-line)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)] sm:block"
      >
        Acceder
      </Link>
    );
  }

  async function handleLogout() {
    setOpen(false);
    try {
      await createBrowserApiClient().auth.logout();
    } catch {}
    logout();
    showToast("Sesión cerrada");
    router.push("/");
    router.refresh();
  }

  const firstName = user.name.split(" ")[0];
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft)]"
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-sm bg-brand-800 text-[10px] font-semibold text-accent-100"
          aria-hidden
        >
          {initials || "·"}
        </span>
        <span className="hidden sm:inline">{firstName}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 w-56 overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] shadow-md"
        >
          <div className="border-b border-[var(--color-line)] px-3 py-2.5">
            <div className="truncate text-[12px] font-semibold text-[var(--color-ink)]">
              {user.name}
            </div>
            <div className="truncate text-[11px] text-[var(--color-ink-mute)]">
              {user.email}
            </div>
          </div>
          {user.role === "admin" && (
            <MenuItem href="/admin" onClick={() => setOpen(false)}>
              Panel admin
            </MenuItem>
          )}
          <MenuItem href="/perfil" onClick={() => setOpen(false)}>
            Mi perfil
          </MenuItem>
          <MenuItem onClick={handleLogout} tone="danger">
            Cerrar sesión
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  onClick,
  tone = "neutral",
  children,
}: {
  href?: string;
  onClick?: () => void;
  tone?: "neutral" | "danger";
  children: React.ReactNode;
}) {
  const cls = `block w-full px-3 py-2 text-left text-[12px] font-medium transition ${
    tone === "danger"
      ? "text-rose-700 hover:bg-rose-50"
      : "text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft)]"
  }`;
  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick} role="menuitem">
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} role="menuitem">
      {children}
    </button>
  );
}
