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
        <div className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px]">
            ✓
          </span>
          {message}
        </div>
      )}
    </div>
  );
}
