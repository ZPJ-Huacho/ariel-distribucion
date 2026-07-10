import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LogoutButton } from "@/features/auth";
import { AdminBrand } from "@/features/admin-dashboard/ui/components/AdminBrand";
import { AdminNav } from "@/features/admin-dashboard/ui/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-30 border-b border-white/[0.08] text-white shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_24px_-12px_rgba(0,0,0,0.4)]"
        style={{
          background: `
            linear-gradient(180deg,
              color-mix(in oklch, var(--primary) 20%, transparent) 0%,
              color-mix(in oklch, var(--primary) 10%, transparent) 100%),
            rgba(9, 12, 18, 0.92)`,
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
          <AdminBrand />

          <AdminNav />

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              aria-label="Ver catálogo"
              title="Ver catálogo"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white sm:text-sm lg:px-3"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Ver catálogo</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-3 pb-24 pt-4 sm:px-4 sm:pb-10 sm:pt-6 lg:px-6">
        {children}
      </main>

      <AdminNav variant="mobile" />
    </div>
  );
}
