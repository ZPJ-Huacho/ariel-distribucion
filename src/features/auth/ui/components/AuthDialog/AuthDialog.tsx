"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/shared/components/atoms/dialog";
import { cn } from "@/shared/lib/utils";
import { LoginForm } from "../LoginForm";
import { RegisterForm } from "../RegisterForm";

export type AuthTab = "login" | "register";

export function AuthDialog({
  open,
  onOpenChange,
  defaultTab = "login",
  next,
  googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "1",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: AuthTab;
  next?: string;
  googleEnabled?: boolean;
}) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const router = useRouter();

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  const isLogin = tab === "login";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[calc(100dvh-2rem)] w-full max-w-[420px] grid-rows-[auto_1fr_auto] gap-0 overflow-hidden p-0 sm:max-w-[420px]"
      >
        <div className="relative flex items-center justify-between border-b border-border/70 bg-card px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"
            >
              {isLogin ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-tight">
                {isLogin ? "Entra a tu cuenta" : "Crea tu cuenta"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isLogin
                  ? "Pide más rápido la próxima vez."
                  : "20 segundos y ya está."}
              </p>
            </div>
          </div>
          <DialogClose
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div className="min-h-0 overflow-y-auto">
          <div className="px-5 pt-4">
            <div
              role="tablist"
              aria-label="Entrar o crear cuenta"
              className="grid grid-cols-2 rounded-lg bg-muted p-1 text-sm"
            >
              <TabButton active={isLogin} onClick={() => setTab("login")}>
                Entrar
              </TabButton>
              <TabButton
                active={!isLogin}
                onClick={() => setTab("register")}
              >
                Crear cuenta
              </TabButton>
            </div>
          </div>

          <div className="px-5 pb-5 pt-4">
            {isLogin ? (
              <LoginForm
                next={next}
                googleEnabled={googleEnabled}
                onSuccess={handleSuccess}
                redirectOnSuccess={false}
              />
            ) : (
              <RegisterForm
                googleEnabled={googleEnabled}
                onSuccess={handleSuccess}
                redirectOnSuccess={false}
              />
            )}
          </div>
        </div>

        <div className="border-t border-border/70 bg-muted/40 px-5 py-2.5 text-center">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Seguir comprando sin cuenta
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
