"use client";

import { useEffect } from "react";
import { createBrowserApiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

export function AuthSync() {
  const setHydrated = useAuth((s) => s.setHydrated);

  useEffect(() => {
    let cancelled = false;
    const client = createBrowserApiClient();
    client.auth
      .me()
      .then((r) => {
        if (!cancelled) setHydrated(r.user);
      })
      .catch(() => {
        if (!cancelled) setHydrated(null);
      });
    return () => {
      cancelled = true;
    };
  }, [setHydrated]);

  return null;
}
