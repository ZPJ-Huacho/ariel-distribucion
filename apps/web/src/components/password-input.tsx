"use client";

import { forwardRef, useState } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput({ className = "", ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          {...rest}
          type={visible ? "text" : "password"}
          className={`${className} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Ver contraseña"}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--color-ink-mute)] hover:text-[var(--color-ink-soft)]"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    );
  },
);

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10 10 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="m1 1 22 22" />
      <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
    </svg>
  );
}
