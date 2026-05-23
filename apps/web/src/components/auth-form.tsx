"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApiError, loginSchema, registerSchema } from "@mercabana/core";
import { tenant } from "@/lib/data/tenant";
import { createBrowserApiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useOrders } from "@/lib/orders-store";
import { useToast } from "@/lib/toast-store";

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
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md border border-brand-700 bg-brand-800 font-display text-base font-semibold tracking-tight text-accent-100">
            FM
          </span>
        </Link>
        <h1 className="mt-3 font-display text-2xl text-[var(--color-ink)]">{tenant.name}</h1>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
          {tenant.tagline}
        </p>
      </div>

      <div className="mb-4 flex rounded-md border border-[var(--color-line)] bg-[var(--color-canvas-soft)] p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-sm px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
            mode === "login"
              ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
              : "text-[var(--color-ink-mute)] hover:text-[var(--color-ink-soft)]"
          }`}
        >
          Acceder
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-sm px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
            mode === "register"
              ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
              : "text-[var(--color-ink-mute)] hover:text-[var(--color-ink-soft)]"
          }`}
        >
          Registrarse
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
      >
        {mode === "register" && (
          <Field label="Nombre" error={errors.name}>
            <input
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Marta García"
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
            />
          </Field>
        )}

        <Field label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="tu@email.com"
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
          />
        </Field>

        <Field label="Contraseña" error={errors.password}>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
          />
        </Field>

        {mode === "register" && (
          <Field label="Teléfono" error={errors.phone} hint="Para confirmar tus pedidos">
            <input
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="612 33 44 55"
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
            />
          </Field>
        )}

        {serverError && (
          <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 w-full rounded-md border border-brand-900 bg-brand-800 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-accent-100 transition hover:bg-brand-900 active:scale-[0.997] disabled:opacity-60"
        >
          {submitting ? "…" : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>

        <Link
          href="/"
          className="block w-full py-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-mute)] hover:text-[var(--color-ink-soft)]"
        >
          Seguir sin cuenta
        </Link>
      </form>

      {mode === "login" && (
        <div className="mt-4 rounded-md border border-[var(--color-line)] bg-[var(--color-canvas-soft)] p-3 text-[11px] text-[var(--color-ink-soft)]">
          <span className="font-semibold uppercase tracking-wide text-[var(--color-ink)]">
            Demo:
          </span>{" "}
          admin@frutas.com / admin123 · acceso al panel de gestión.
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-[11px] text-[var(--color-ink-mute)]">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-rose-700">{error}</span>
      )}
    </label>
  );
}
