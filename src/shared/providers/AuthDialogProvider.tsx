"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthDialog, type AuthTab } from "@/features/auth";

type Ctx = {
  open: (opts?: { tab?: AuthTab; next?: string }) => void;
  close: () => void;
};

const AuthDialogContext = createContext<Ctx | null>(null);

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthTab>("login");
  const [next, setNext] = useState<string | undefined>(undefined);
  const handledKeyRef = useRef<string | null>(null);

  const open = useCallback((opts?: { tab?: AuthTab; next?: string }) => {
    setTab(opts?.tab ?? "login");
    setNext(opts?.next);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  // Auto-abrir cuando la URL trae ?auth=login|register (viene del middleware
  // admin, del redirect de sesión expirada, o de un link directo).
  useEffect(() => {
    const auth = searchParams.get("auth");
    if (!auth) return;
    const key = `${pathname}?${searchParams.toString()}`;
    if (handledKeyRef.current === key) return;
    handledKeyRef.current = key;

    const requestedTab: AuthTab = auth === "register" ? "register" : "login";
    const nextParam = searchParams.get("next") ?? undefined;
    open({ tab: requestedTab, next: nextParam });

    // Limpia la URL para que un refresh no vuelva a abrir el modal.
    const clean = new URLSearchParams(searchParams);
    clean.delete("auth");
    clean.delete("next");
    const qs = clean.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, open, router]);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <AuthDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultTab={tab}
        next={next}
      />
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog(): Ctx {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error("useAuthDialog must be inside AuthDialogProvider");
  return ctx;
}
