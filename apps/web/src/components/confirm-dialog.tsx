"use client";

import { useEffect } from "react";

type Tone = "danger" | "neutral";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "neutral",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const isDanger = tone === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-ink)]/45 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-t-md border-x border-t border-[var(--color-line)] bg-[var(--color-canvas)] sm:rounded-md sm:border">
        <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
              isDanger ? "text-rose-700" : "text-brand-700"
            }`}
          >
            {isDanger ? "Confirmar eliminación" : "Confirmar"}
          </span>
          <h2 className="font-display text-lg text-[var(--color-ink)]">{title}</h2>
        </header>

        {description && (
          <div className="px-5 py-4 text-sm text-[var(--color-ink-soft)]">{description}</div>
        )}

        <footer className="flex gap-2 border-t border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-[var(--color-line)] py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)] hover:bg-[var(--color-canvas-soft)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={
              isDanger
                ? "flex-1 rounded-md border border-rose-800 bg-rose-700 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-rose-800"
                : "flex-1 rounded-md border border-brand-900 bg-brand-800 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-100 transition hover:bg-brand-900"
            }
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
