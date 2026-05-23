"use client";

import { useToast } from "@/lib/toast-store";

export function Toast() {
  const message = useToast((s) => s.message);

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 transition-all duration-200 ${
        message ? "opacity-100 translate-y-0" : "-translate-y-4 opacity-0"
      }`}
      aria-live="polite"
    >
      {message && (
        <div className="flex items-center gap-2 rounded-md border border-brand-900 bg-brand-800 px-4 py-2.5 text-[12px] font-medium text-accent-100 shadow-lg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {message}
        </div>
      )}
    </div>
  );
}
