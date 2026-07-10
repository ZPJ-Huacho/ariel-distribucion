"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import { useUpdateProfile } from "../../../api/useUpdateProfile";
import { Button } from "@/shared/components/atoms/button";
import { Label } from "@/shared/components/atoms/label";
import { PasswordInput } from "@/shared/components/atoms/password-input";
import { toUiMessage } from "@/shared/lib/errors";

type Errors = { current?: string; next?: string; confirm?: string };

function validate(current: string, next: string, confirm: string): Errors {
  const errors: Errors = {};
  if (!current) errors.current = "Necesitamos tu contraseña actual.";
  if (!next) errors.next = "Escribe una nueva contraseña.";
  else if (next.length < 4) errors.next = "Mínimo 4 caracteres.";
  if (next && confirm && confirm !== next)
    errors.confirm = "Las contraseñas no coinciden.";
  return errors;
}

export function SecurityCard() {
  const update = useUpdateProfile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<{
    current?: boolean;
    next?: boolean;
    confirm?: boolean;
  }>({});

  const errors = validate(currentPassword, newPassword, confirmPassword);
  const valid =
    !!currentPassword &&
    !!newPassword &&
    newPassword.length >= 4 &&
    newPassword === confirmPassword;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ current: true, next: true, confirm: true });
    if (!valid) {
      toast.error("Revisa los campos marcados.");
      return;
    }
    try {
      await update.mutateAsync({ currentPassword, newPassword });
      toast.success("Contraseña actualizada.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTouched({});
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos actualizar la contraseña."));
    }
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Seguridad</h3>
            <p className="text-xs text-muted-foreground">
              Cambia tu contraseña. Necesitas la actual para confirmar.
            </p>
          </div>
        </div>
      </header>
      <form
        className="flex flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 md:px-8 md:py-7"
        onSubmit={submit}
        noValidate
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-current">Contraseña actual</Label>
          <PasswordInput
            id="p-current"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, current: true }))}
            aria-invalid={touched.current && !!errors.current}
            className="h-10"
          />
          {touched.current && errors.current && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" aria-hidden />
              {errors.current}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="p-new">Nueva contraseña</Label>
          <PasswordInput
            id="p-new"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, next: true }))}
            aria-invalid={touched.next && !!errors.next}
            className="h-10"
          />
          {touched.next && errors.next && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" aria-hidden />
              {errors.next}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="p-confirm">Confirmar nueva contraseña</Label>
          <PasswordInput
            id="p-confirm"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            aria-invalid={touched.confirm && !!errors.confirm}
            className="h-10"
          />
          {touched.confirm && errors.confirm && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" aria-hidden />
              {errors.confirm}
            </p>
          )}
        </div>

        <div className="flex flex-col items-stretch gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="submit"
            disabled={!valid || update.isPending}
            className="w-full sm:w-auto"
          >
            <KeyRound className="mr-2 h-4 w-4" aria-hidden />
            {update.isPending ? "Guardando..." : "Cambiar contraseña"}
          </Button>
        </div>
      </form>
    </div>
  );
}
