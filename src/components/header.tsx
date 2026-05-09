import Link from "next/link";
import { tenant } from "@/lib/data/tenant";

export function Header({ adminLink = false }: { adminLink?: boolean }) {
  const waLink = `https://wa.me/${tenant.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hola! quería pedir desde tu web.`,
  )}`;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl shadow-sm"
            aria-hidden
          >
            {tenant.emoji}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-stone-900">{tenant.name}</span>
            <span className="text-[11px] text-stone-500">{tenant.deliveryHours}</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {adminLink && (
            <Link
              href="/admin"
              className="hidden rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 sm:block"
            >
              Panel admin
            </Link>
          )}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M19.05 4.91A9.92 9.92 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.93 9.93 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02zM12.04 20.15a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.25 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.71 2.61 4.13 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
