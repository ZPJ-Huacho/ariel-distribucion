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
import { toast } from "sonner";
import { AuthDialog, type AuthTab } from "@/features/auth";

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "No tienes permisos para acceder a esa sección.",
};

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

  // Reacciona a query params one-shot: ?auth=login|register abre el modal,
  // ?error=<code> lanza un toast. Ambos vienen del proxy (admin sin sesión /
  // sin permisos), de sesión expirada o de un link directo.
  useEffect(() => {
    const auth = searchParams.get("auth");
    const error = searchParams.get("error");
    if (!auth && !error) return;

    const key = `${pathname}?${searchParams.toString()}`;
    if (handledKeyRef.current === key) return;
    handledKeyRef.current = key;

    if (auth) {
      const requestedTab: AuthTab = auth === "register" ? "register" : "login";
      const nextParam = searchParams.get("next") ?? undefined;
      open({ tab: requestedTab, next: nextParam });
    }
    if (error) {
      toast.error(ERROR_MESSAGES[error] ?? "Algo salió mal.");
    }

    // Limpia la URL para que un refresh no vuelva a disparar el modal ni el toast.
    const clean = new URLSearchParams(searchParams);
    clean.delete("auth");
    clean.delete("next");
    clean.delete("error");
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
