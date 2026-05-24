"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { ApiError, loginSchema, registerSchema } from "@mercabana/core";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tenant } from "@/lib/data/tenant";
import { createBrowserApiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useOrders } from "@/lib/orders-store";
import { useToast } from "@/lib/toast-store";
import { PasswordInput } from "@/components/password-input";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export function AuthForm({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const [mode, setMode] = useState<Mode>(initialMode);

  const login = useAuth((s) => s.login);
  const setCustomer = useOrders((s) => s.setCustomer);
  const showToast = useToast((s) => s.show);

  const [values, setValues] = useState({ name: "", email: "", password: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSubmitting(true);

    const client = createBrowserApiClient();
    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse(values);
        if (!parsed.success) {
          const f: Record<string, string> = {};
          for (const issue of parsed.error.issues) f[String(issue.path[0])] = issue.message;
          setErrors(f);
          return;
        }
        const { user } = await client.auth.login(parsed.data);
        login(user);
        showToast(`Sesión iniciada · ${user.name.split(" ")[0]}`);
        if (user.role === "admin") {
          router.push("/admin");
        } else {
          setCustomer({
            customerName: user.name,
            customerPhone: user.phone ?? "",
          });
          router.push(redirect);
        }
      } else {
        const parsed = registerSchema.safeParse(values);
        if (!parsed.success) {
          const f: Record<string, string> = {};
          for (const issue of parsed.error.issues) f[String(issue.path[0])] = issue.message;
          setErrors(f);
          return;
        }
        const { user } = await client.auth.register(parsed.data);
        login(user);
        setCustomer({
          customerName: user.name,
          customerPhone: user.phone ?? "",
        });
        showToast(`Cuenta creada · ${user.name.split(" ")[0]}`);
        router.push(redirect);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setServerError("Email o contraseña incorrectos.");
        else if (err.status === 409) setServerError("Ya existe una cuenta con ese email.");
        else setServerError("No se pudo procesar la petición.");
      } else {
        setServerError("Sin conexión con el servidor. Intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-7 text-center">
        <Link
          href="/"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20"
        >
          <Sprout className="h-6 w-6" />
        </Link>
        <h1 className="mt-4 text-[26px] font-semibold tracking-tight text-foreground">
          {tenant.name}
        </h1>
        <p className="text-[12.5px] text-muted-foreground">{tenant.tagline}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[20px]">
            {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Accede para gestionar tus pedidos."
              : "Te confirmamos por WhatsApp cuando esté listo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 inline-flex rounded-lg border border-border bg-muted/40 p-1">
            <ModeButton active={mode === "login"} onClick={() => setMode("login")}>
              Acceder
            </ModeButton>
            <ModeButton active={mode === "register"} onClick={() => setMode("register")}>
              Registrarse
            </ModeButton>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === "register" && (
              <Field label="Nombre" error={errors.name} id="name">
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Marta García"
                />
              </Field>
            )}

            <Field label="Email" error={errors.email} id="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="tu@email.com"
              />
            </Field>

            <Field label="Contraseña" error={errors.password} id="password">
              <PasswordInput
                id="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={values.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {mode === "register" && (
              <Field
                label="Teléfono"
                error={errors.phone}
                hint="Para confirmar tus pedidos"
                id="phone"
              >
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="612 33 44 55"
                />
              </Field>
            )}

            {serverError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12.5px] font-medium text-destructive">
                {serverError}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="mt-1 w-full">
              {submitting ? "…" : mode === "login" ? "Entrar" : "Crear cuenta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full text-muted-foreground",
            )}
          >
            Seguir sin cuenta
          </Link>
        </CardFooter>
      </Card>

      {mode === "login" && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[12px] text-muted-foreground">
          <span className="font-semibold text-foreground">Demo:</span>{" "}
          admin@frutas.com / admin123 · acceso al panel.
        </div>
      )}
    </div>
  );
}

function ModeButton({
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
      onClick={onClick}
      className={cn(
        "rounded-md px-4 py-1.5 text-[12.5px] font-medium transition",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  hint,
  error,
  id,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p className="text-[11.5px] text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-[11.5px] font-medium text-destructive">{error}</p>}
    </div>
  );
}
