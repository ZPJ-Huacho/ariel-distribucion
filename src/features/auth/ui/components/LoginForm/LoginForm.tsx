"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { LogIn, Mail } from "lucide-react";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { PasswordInput } from "@/shared/components/atoms/password-input";
import { GoogleButton } from "../GoogleButton";

export function LoginForm({
  nextPromise,
  next: nextProp,
  googleEnabled = false,
  onSuccess,
  redirectOnSuccess = true,
}: {
  nextPromise?: Promise<{ next?: string }>;
  next?: string;
  googleEnabled?: boolean;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}) {
  const router = useRouter();
  const fromPromise = nextPromise ? use(nextPromise).next : undefined;
  const next = nextProp ?? fromPromise;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (website) return;
    setError(null);
    setBusy(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      const msg = "Email o contraseña incorrectos";
      setError(msg);
      toast.error(msg);
      return;
    }
    onSuccess?.();
    if (redirectOnSuccess) {
      router.push(next ?? "/");
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {googleEnabled && (
        <>
          <GoogleButton next={next} />
          <div className="relative flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              o con tu email
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">No rellenes este campo</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            aria-invalid={!!error}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span>Mantener sesión iniciada en este dispositivo</span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button type="submit" className="w-full h-11" disabled={busy}>
        <LogIn className="mr-2 h-4 w-4" aria-hidden />
        {busy ? "Entrando..." : "Entrar"}
      </Button>
    </form>
    </div>
  );
}
