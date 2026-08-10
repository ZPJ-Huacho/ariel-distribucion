"use client";

import Script from "next/script";
import { useEffect, useId, useRef } from "react";

type TurnstileWindow = Window & {
  turnstile?: {
    render: (
      el: string | HTMLElement,
      opts: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback"?: () => void;
        "expired-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "flexible" | "compact" | "invisible";
        action?: string;
      },
    ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId?: string) => void;
  };
};

export function Turnstile({
  onToken,
  action,
  className,
}: {
  onToken: (token: string | null) => void;
  action?: string;
  className?: string;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const rawId = useId();
  const containerId = `ts-${rawId.replace(/[:]/g, "")}`;
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    const w = window as TurnstileWindow;
    let cancelled = false;

    const tryRender = () => {
      if (cancelled) return;
      if (!w.turnstile) {
        setTimeout(tryRender, 150);
        return;
      }
      if (widgetIdRef.current) return;
      const el = document.getElementById(containerId);
      if (!el) return;
      widgetIdRef.current = w.turnstile.render(el, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "error-callback": () => onToken(null),
        "expired-callback": () => onToken(null),
        action,
        theme: "auto",
      });
    };

    tryRender();
    return () => {
      cancelled = true;
      if (widgetIdRef.current && w.turnstile) {
        try {
          w.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, containerId, action, onToken]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        strategy="afterInteractive"
      />
      <div id={containerId} className={className} />
    </>
  );
}

export const turnstileClientEnabled =
  !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
