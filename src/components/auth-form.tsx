"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { tenant } from "@/lib/data/tenant";
import { tryLogin, tryRegister, useAuth } from "@/lib/auth-store";
import { useOrders } from "@/lib/orders-store";
import { useToast } from "@/lib/toast-store";

type Mode = "login" | "register";

const loginSchema = z.object({
  email: z.string().email("Email no válido."),
  password: z.string().min(4, "Mínimo 4 caracteres."),
});

const registerSchema = z.object({
  name: z.string().min(2, "Pon tu nombre."),
  email: z.string().email("Email no válido."),
  password: z.string().min(4, "Mínimo 4 caracteres."),
  phone: z.string().min(9, "Teléfono no válido.").regex(/^[0-9 +\-]+$/, "Solo números."),
});

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

  function update(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
    setServerError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (mode === "login") {
      const parsed = loginSchema.safeParse(values);
      if (!parsed.success) {
        const f: Record<string, string> = {};
        for (const issue of parsed.error.issues) f[String(issue.path[0])] = issue.message;
        setErrors(f);
        return;
      }
      const res = tryLogin(parsed.data.email, parsed.data.password);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      login(res.user);
      showToast(`Hola, ${res.user.name.split(" ")[0]} 👋`);
      if (res.user.role === "admin") {
        router.push("/admin");
      } else {
        setCustomer({
          customerName: res.user.name,
          customerPhone: res.user.phone ?? "",
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
      const res = tryRegister(parsed.data);
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      login(res.user);
      setCustomer({
        customerName: res.user.name,
        customerPhone: res.user.phone ?? "",
      });
      showToast(`¡Bienvenido, ${res.user.name.split(" ")[0]}!`);
      router.push(redirect);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl shadow-md">
            {tenant.emoji}
          </span>
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-stone-900">{tenant.name}</h1>
        <p className="text-sm text-stone-500">{tenant.tagline}</p>
      </div>

      <div className="mb-4 flex rounded-full bg-stone-200 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "login" ? "bg-white text-stone-900 shadow" : "text-stone-600"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "register" ? "bg-white text-stone-900 shadow" : "text-stone-600"
          }`}
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        {mode === "register" && (
          <Field label="Tu nombre" error={errors.name}>
            <input
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Marta García"
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
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
            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
          />
        </Field>

        <Field label="Contraseña" error={errors.password}>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
          />
        </Field>

        {mode === "register" && (
          <Field label="Teléfono" error={errors.phone} hint="Para que te confirmemos los pedidos">
            <input
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="612 33 44 55"
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
            />
          </Field>
        )}

        {serverError && (
          <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          className="mt-1 w-full rounded-full bg-brand-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-700 active:scale-[0.99]"
        >
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>

        <Link
          href="/"
          className="block w-full rounded-full py-3 text-center text-xs font-medium text-stone-500 hover:text-stone-700"
        >
          Seguir sin cuenta
        </Link>
      </form>

      {mode === "login" && (
        <div className="mt-4 rounded-xl bg-stone-100 p-3 text-[11px] text-stone-600">
          <span className="font-semibold text-stone-700">Demo:</span>{" "}
          admin@frutas.com / admin123 (entra como dueño y verás el panel admin).
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
      <span className="mb-1 block px-1 text-sm font-medium text-stone-800">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block px-1 text-[11px] text-stone-500">{hint}</span>}
      {error && <span className="mt-1 block px-1 text-[11px] font-medium text-rose-600">{error}</span>}
    </label>
  );
}
