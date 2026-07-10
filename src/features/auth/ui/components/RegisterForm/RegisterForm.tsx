"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Mail, Phone, User, UserPlus } from "lucide-react";
import { useRegister } from "../../../api/useRegister";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { PasswordInput } from "@/shared/components/atoms/password-input";

function strengthOf(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (pw.length < 4) return { score: 0, label: "Muy corta" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const label = ["Débil", "Aceptable", "Buena", "Fuerte"][score] ?? "Débil";
  return { score: Math.min(score, 3) as 0 | 1 | 2 | 3, label };
}

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const strength = useMemo(() => strengthOf(password), [password]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register.mutateAsync({ name, email, phone, password });
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Cuenta creada pero no pudimos iniciar sesión.");
        return;
      }
      toast.success("Cuenta creada. ¡Bienvenido!");
      router.push("/");
      router.refresh();
    } catch (err) {
      const kind = (err as { kind?: string } | undefined)?.kind;
      const msg =
        kind === "conflict"
          ? "Ese email ya está registrado."
          : "No pudimos crear tu cuenta.";
      setError(msg);
      toast.error(msg);
    }
  }

  const strengthColors = [
    "bg-destructive",
    "bg-amber-500",
    "bg-lime-500",
    "bg-emerald-500",
  ];

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre</Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="name"
            autoComplete="name"
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-9"
          />
        </div>
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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <div className="relative">
          <Phone
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-9"
            placeholder="+34600000000"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password && (
          <div className="flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded ${
                    i <= strength.score
                      ? strengthColors[strength.score]
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={register.isPending}>
        <UserPlus className="mr-2 h-4 w-4" aria-hidden />
        {register.isPending ? "Creando..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
