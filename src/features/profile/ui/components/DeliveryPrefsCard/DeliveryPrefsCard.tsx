"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CircleCheck, Clock, MapPin, Truck } from "lucide-react";
import type { User } from "@/core/users";
import { useUpdateProfile } from "../../../api/useUpdateProfile";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { Textarea } from "@/shared/components/atoms/textarea";
import { toUiMessage } from "@/shared/lib/errors";

type Errors = { address?: string; preferredDeliveryTime?: string };

function validate(address: string, time: string): Errors {
  const errors: Errors = {};
  if (address.length > 240) errors.address = "Máximo 240 caracteres.";
  if (time.length > 120) errors.preferredDeliveryTime = "Máximo 120 caracteres.";
  return errors;
}

export function DeliveryPrefsCard({ user }: { user: User }) {
  const update = useUpdateProfile();
  const [address, setAddress] = useState(user.address ?? "");
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState(
    user.preferredDeliveryTime ?? "",
  );

  const errors = validate(address, preferredDeliveryTime);
  const dirty =
    address !== (user.address ?? "") ||
    preferredDeliveryTime !== (user.preferredDeliveryTime ?? "");
  const valid = !errors.address && !errors.preferredDeliveryTime;

  useEffect(() => {
    setAddress(user.address ?? "");
    setPreferredDeliveryTime(user.preferredDeliveryTime ?? "");
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      toast.error("Revisa los campos marcados.");
      return;
    }
    try {
      await update.mutateAsync({ address, preferredDeliveryTime });
      toast.success("Preferencias guardadas.");
    } catch (err) {
      toast.error(toUiMessage(err, "No pudimos guardar las preferencias."));
    }
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Truck className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Entrega</h3>
            <p className="text-xs text-muted-foreground">
              Autocompletamos tus próximos pedidos con estos datos.
            </p>
          </div>
        </div>
      </header>
      <form className="flex flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 md:px-8 md:py-7" onSubmit={submit} noValidate>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="p-address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              Dirección de entrega
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {address.length}/240
            </span>
          </div>
          <Textarea
            id="p-address"
            autoComplete="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            maxLength={240}
            aria-invalid={!!errors.address}
            placeholder="Calle, número, piso, ciudad, código postal..."
          />
          {errors.address && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" aria-hidden />
              {errors.address}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="p-time" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              Horario preferido
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {preferredDeliveryTime.length}/120
            </span>
          </div>
          <Input
            id="p-time"
            value={preferredDeliveryTime}
            onChange={(e) => setPreferredDeliveryTime(e.target.value)}
            className="h-10"
            maxLength={120}
            aria-invalid={!!errors.preferredDeliveryTime}
            placeholder="Mañanas antes de las 12h, tardes..."
          />
          {errors.preferredDeliveryTime && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" aria-hidden />
              {errors.preferredDeliveryTime}
            </p>
          )}
        </div>

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
            {update.isPending ? "Guardando..." : "Guardar preferencias"}
          </Button>
        </div>
      </form>
    </div>
  );
}
