"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, updateProfileSchema } from "@mercabana/core";
import type { AuthUser } from "@mercabana/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <Card>
      <CardHeader>
        <CardTitle>Datos de cuenta</CardTitle>
        <CardDescription>Edita tu nombre, teléfono o contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field label="Email" hint="No se puede cambiar" id="email">
            <Input id="email" type="email" value={user.email} disabled />
          </Field>

          <Field label="Nombre" error={errors.name} id="name">
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>

          <Field label="Teléfono" error={errors.phone} id="phone">
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="612 33 44 55"
            />
          </Field>

          <Separator className="my-2" />

          <div className="space-y-1.5">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Cambiar contraseña
            </h3>
            <p className="text-[12px] text-muted-foreground">
              Déjalo en blanco si no quieres cambiarla.
            </p>
          </div>

          <Field label="Contraseña actual" error={errors.currentPassword} id="currentPassword">
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={(e) => update("currentPassword", e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Nueva contraseña" error={errors.newPassword} id="newPassword">
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              value={values.newPassword}
              onChange={(e) => update("newPassword", e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12.5px] font-medium text-destructive">
              {serverError}
            </div>
          )}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
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
