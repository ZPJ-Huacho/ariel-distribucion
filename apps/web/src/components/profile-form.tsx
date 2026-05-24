"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, updateProfileSchema } from "@mercabana/core";
import type { AuthUser } from "@mercabana/core";
import { createBrowserApiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useToast } from "@/lib/toast-store";
import { PasswordInput } from "@/components/password-input";

export function ProfileForm({ user }: { user: AuthUser }) {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const showToast = useToast((s) => s.show);

  const [values, setValues] = useState({
    name: user.name,
    phone: user.phone ?? "",
    currentPassword: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const payload: Record<string, string | undefined> = {};
    if (values.name.trim() && values.name !== user.name) payload.name = values.name.trim();
    if (values.phone.trim() !== (user.phone ?? "")) payload.phone = values.phone.trim();
    if (values.newPassword) {
      payload.newPassword = values.newPassword;
      payload.currentPassword = values.currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      showToast("No hay cambios que guardar");
      return;
    }

    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const f: Record<string, string> = {};
      for (const issue of parsed.error.issues) f[String(issue.path[0])] = issue.message;
      setErrors(f);
      return;
    }

    setSaving(true);
    try {
      const { user: updated } = await createBrowserApiClient().auth.updateProfile(parsed.data);
      login(updated);
      setValues((v) => ({ ...v, currentPassword: "", newPassword: "" }));
      showToast("Perfil actualizado");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setServerError("La contraseña actual no es correcta.");
        else setServerError("No se pudo actualizar el perfil.");
      } else {
        setServerError("Sin conexión con el servidor.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
    >
      <Field label="Email" hint="No se puede cambiar">
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-canvas-soft)] px-3.5 py-3 text-sm text-[var(--color-ink-mute)]"
        />
      </Field>

      <Field label="Nombre" error={errors.name}>
        <input
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
        />
      </Field>

      <Field label="Teléfono" error={errors.phone}>
        <input
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="612 33 44 55"
          className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
        />
      </Field>

      <fieldset className="space-y-3 border-t border-[var(--color-line)] pt-4">
        <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
          Cambiar contraseña
        </legend>
        <Field label="Contraseña actual" error={errors.currentPassword}>
          <PasswordInput
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={(e) => update("currentPassword", e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
          />
        </Field>
        <Field label="Nueva contraseña" error={errors.newPassword} hint="Déjalo en blanco si no quieres cambiarla">
          <PasswordInput
            autoComplete="new-password"
            value={values.newPassword}
            onChange={(e) => update("newPassword", e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
          />
        </Field>
      </fieldset>

      {serverError && (
        <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md border border-brand-900 bg-brand-800 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-accent-100 transition hover:bg-brand-900 disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
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
