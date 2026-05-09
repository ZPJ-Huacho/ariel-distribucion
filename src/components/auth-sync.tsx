"use client";

import { useEffect, useRef } from "react";
import { AUTH_STORAGE_KEY, useAuth } from "@/lib/auth-store";
import type { AuthUser } from "@/lib/auth-store";

export function AuthSync() {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const setHydrated = useAuth((s) => s.setHydrated);
  const initialMount = useRef(true);

  useEffect(() => {
    let stored: AuthUser | null = null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as AuthUser;
    } catch {}
    setHydrated(stored);
  }, [setHydrated]);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (!hydrated) return;
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {}
  }, [user, hydrated]);

  return null;
}
