"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCart, cartTotal } from "@/lib/cart-store";
import { useOrders } from "@/lib/orders-store";
import { CartLine } from "@/components/cart-line";
import { formatPrice } from "@/lib/format";
import { tenant } from "@/lib/data/tenant";
import { getCurrentSource } from "@/lib/source-tracking";
import { buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import type { DemoOrder } from "@mercabana/core";

const orderSchema = z.object({
  customerName: z.string().min(2, "Pon tu nombre, por favor."),
  customerPhone: z
    .string()
    .min(9, "Pon un teléfono válido.")
    .regex(/^[0-9 +\-]+$/, "Solo números."),
  customerAddress: z.string().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof orderSchema>;

const initialValues: FormValues = {
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  preferredTime: "",
  notes: "",
};

function generateOrderId(): string {
  const n = Math.floor(2500 + Math.random() * 8000);
  return `PED-${n}`;
}

export function OrderFlow() {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const total = cartTotal(items);

  const customer = useOrders((s) => s.customer);
  const hydrated = useOrders((s) => s.hydrated);
  const addOrder = useOrders((s) => s.addOrder);
  const setCustomer = useOrders((s) => s.setCustomer);

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [confirmation, setConfirmation] = useState<DemoOrder | null>(null);

  useEffect(() => {
    if (hydrated && customer) {
      setValues((v) => ({
        ...v,
        customerName: v.customerName || customer.customerName,
        customerPhone: v.customerPhone || customer.customerPhone,
        customerAddress: v.customerAddress || customer.customerAddress || "",
      }));
    }
  }, [hydrated, customer]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = orderSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    const source = getCurrentSource();
    const order: DemoOrder = {
      id: generateOrderId(),
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerAddress: parsed.data.customerAddress,
      preferredTime: parsed.data.preferredTime,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        price: i.price,
      })),
      total,
      status: "pending",
      source,
      createdAt: new Date().toISOString(),
      notes: parsed.data.notes,
      isNew: true,
    };
    addOrder(order);
    setCustomer({
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerAddress: parsed.data.customerAddress,
    });
    clearCart();
    setConfirmation(order);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (items.length === 0 && !confirmation) {
    return (
      <Card className="border-dashed py-14 text-center">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              Tu cesta está vacía
            </h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Vuelve al catálogo y añade los productos que quieras pedir.
            </p>
          </div>
          <Link
            href="/"
            className={cn(buttonVariants(), "rounded-full")}
          >
            Ver catálogo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (confirmation) {
    const waMessage = buildOrderMessage(
      confirmation.items.map((i) => ({
        productId: i.name,
        name: i.name,
        price: i.price,
        unit: i.unit,
        emoji: "",
        gradient: "",
        quantity: i.quantity,
      })),
      {
        customerName: confirmation.customerName,
        customerPhone: confirmation.customerPhone,
        customerAddress: confirmation.customerAddress,
        preferredTime: confirmation.preferredTime,
        notes: confirmation.notes,
        source: confirmation.source,
      },
      tenant,
    );
    const waLink = buildWhatsAppLink(waMessage, tenant.whatsappNumber);

    return (
      <Card className="text-center">
        <CardContent className="flex flex-col items-center gap-5 py-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <Badge variant="secondary" className="rounded-full text-[10.5px]">
              Pedido recibido
            </Badge>
            <h2 className="mt-2 text-[26px] font-semibold tracking-tight text-foreground">
              Gracias, {confirmation.customerName.split(" ")[0]}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-[14px] text-muted-foreground">
              {tenant.name} ha registrado tu pedido{" "}
              <span className="font-semibold text-foreground">{confirmation.id}</span>.
              Te confirmamos por WhatsApp en unos minutos.
            </p>
          </div>

          <div className="w-full max-w-xs rounded-2xl border border-border bg-muted/30 p-4 text-left">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>Total</span>
              <span>
                {confirmation.items.length} producto{confirmation.items.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 text-[28px] font-semibold tabular-nums tracking-tight text-foreground">
              {formatPrice(confirmation.total)}
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Pago a la entrega · {tenant.deliveryHours.toLowerCase()}
            </p>
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-[13px] font-semibold text-emerald-50 transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar copia por WhatsApp
          </a>
          <p className="text-[11.5px] text-muted-foreground">
            Compartir el pedido por WhatsApp acelera la confirmación.
          </p>
          <Link
            href="/"
            className="text-[12.5px] font-medium text-muted-foreground transition hover:text-foreground"
          >
            ← Volver al catálogo
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Tu pedido · {items.length} {items.length === 1 ? "producto" : "productos"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="space-y-2">
            {items.map((item) => (
              <CartLine key={item.productId} item={item} />
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] opacity-90">
              Total
            </span>
            <span className="text-[20px] font-semibold tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Datos de entrega
          </CardTitle>
          {hydrated && customer && (
            <Badge variant="secondary" className="w-fit rounded-full text-[10.5px]">
              Rellenado por ti
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Nombre" required error={errors.customerName} id="customerName">
              <Input
                id="customerName"
                type="text"
                autoComplete="name"
                value={values.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                placeholder="Marta García"
              />
            </Field>
            <Field label="Teléfono" required error={errors.customerPhone} id="customerPhone">
              <Input
                id="customerPhone"
                type="tel"
                autoComplete="tel"
                value={values.customerPhone}
                onChange={(e) => update("customerPhone", e.target.value)}
                placeholder="612 33 44 55"
              />
            </Field>
            <Field
              label="Dirección de entrega"
              error={errors.customerAddress}
              hint="Opcional · si recoges en tienda déjalo en blanco"
              id="customerAddress"
            >
              <Input
                id="customerAddress"
                type="text"
                autoComplete="street-address"
                value={values.customerAddress}
                onChange={(e) => update("customerAddress", e.target.value)}
                placeholder="C/ Aragó 12, local 3 · Barcelona"
              />
            </Field>
            <Field label="Hora preferida" error={errors.preferredTime} id="preferredTime">
              <Select
                value={values.preferredTime}
                onValueChange={(v) => update("preferredTime", v ?? "")}
              >
                <SelectTrigger id="preferredTime" className="w-full">
                  <SelectValue placeholder="Cualquier hora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mañana (8-12 h)">Mañana (8-12 h)</SelectItem>
                  <SelectItem value="Mediodía (12-14 h)">Mediodía (12-14 h)</SelectItem>
                  <SelectItem value="Tarde (16-19 h)">Tarde (16-19 h)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Notas"
              hint="Opcional · indicaciones para la entrega"
              error={errors.notes}
              id="notes"
            >
              <Textarea
                id="notes"
                value={values.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
              />
            </Field>

            <Button type="submit" className="mt-2 w-full">
              Confirmar pedido
            </Button>
            <p className="text-center text-[11.5px] text-muted-foreground">
              {tenant.name} confirma por WhatsApp · pago a la entrega
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  id,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[11.5px] text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-[11.5px] font-medium text-destructive">{error}</p>}
    </div>
  );
}
