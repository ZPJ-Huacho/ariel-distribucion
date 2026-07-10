"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CircleCheck, Mail, Phone, User as UserIcon } from "lucide-react";
import type { User } from "@/core/users";
import { useUpdateProfile } from "../../../api/useUpdateProfile";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { toUiMessage } from "@/shared/lib/errors";

const PHONE_RE = /^[0-9 +\-]+$/;

type Errors = { name?: string; phone?: string };

function validate(name: string, phone: string): Errors {
  const errors: Errors = {};
  if (name.trim().length < 2) errors.name = "Mínimo 2 caracteres.";
  if (phone) {
    if (!PHONE_RE.test(phone)) errors.phone = "Solo números, espacios, + y -.";
    else if (phone.replace(/[^0-9]/g, "").length < 9)
      errors.phone = "Teléfono no válido (mínimo 9 dígitos).";
  }
  return errors;
}

export function PersonalInfoCard({ user }: { user: User }) {
  const update = useUpdateProfile();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean }>({});

  const errors = validate(name, phone);
  const dirty = name !== user.name || phone !== (user.phone ?? "");
  const valid = !errors.name && !errors.phone;

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone ?? "");
    setTouched({});
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    if (!valid) {
      toast.error("Revisa los campos marcados.");
      return;
    }
    try {
      await update.mutateAsync({ name: name.trim(), phone });
      toast.success("Datos guardados.");
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos guardar los datos."));
    }
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserIcon className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Datos personales</h3>
            <p className="text-xs text-muted-foreground">
              Cómo te identificamos en tus pedidos.
            </p>
          </div>
        </div>
      </header>
      <form className="flex flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 md:px-8 md:py-7" onSubmit={submit} noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-email">Email</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="p-email"
              value={user.email}
              readOnly
              disabled
              className="h-10 pl-9 opacity-70"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            El email no se puede cambiar desde aquí.
          </p>
        </div>

        <FieldWithError error={touched.name ? errors.name : undefined}>
          <Label htmlFor="p-name">Nombre</Label>
          <div className="relative">
            <UserIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="p-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-invalid={touched.name && !!errors.name}
              required
              className="h-10 pl-9"
            />
          </div>
        </FieldWithError>

        <FieldWithError error={touched.phone ? errors.phone : undefined}>
          <Label htmlFor="p-phone">Teléfono</Label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="p-phone"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              aria-invalid={touched.phone && !!errors.phone}
              className="h-10 pl-9"
              placeholder="+34600000000"
            />
          </div>
        </FieldWithError>

        <div className="flex flex-col-reverse items-stretch gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end">
          {dirty && (
            <span className="text-center text-xs text-muted-foreground sm:text-left">
              Cambios sin guardar
            </span>
          )}
          <Button
            type="submit"
            disabled={!dirty || !valid || update.isPending}
            className="w-full sm:w-auto"
          >
            <CircleCheck className="mr-2 h-4 w-4" aria-hidden />
            {update.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FieldWithError({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
