"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useCart, cartTotal } from "@/lib/cart-store";
import { useOrders } from "@/lib/orders-store";
import { CartLine } from "@/components/cart-line";
import { formatPrice } from "@/lib/format";
import { tenant } from "@/lib/data/tenant";
import { getCurrentSource } from "@/lib/source-tracking";
import { buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import type { DemoOrder } from "@/lib/data/types";

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
      <div className="rounded-md border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-[var(--color-line)] bg-[var(--color-canvas-soft)] text-[var(--color-ink-soft)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 className="font-display text-lg text-[var(--color-ink)]">Tu cesta está vacía</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">
          Vuelve al catálogo y añade los productos que quieras pedir.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md border border-brand-800 bg-brand-800 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-100 hover:bg-brand-900"
        >
          Ver catálogo
        </Link>
      </div>
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
      <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm border border-brand-700 bg-brand-800 text-accent-100">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-700">
          Pedido recibido
        </span>
        <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
          Gracias, {confirmation.customerName.split(" ")[0]}.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-ink-soft)]">
          {tenant.name} ha registrado tu pedido{" "}
          <span className="font-semibold text-[var(--color-ink)]">{confirmation.id}</span>. Te
          confirmamos por WhatsApp en unos minutos.
        </p>
        <div className="mx-auto mt-6 max-w-xs rounded-sm border border-[var(--color-line)] bg-[var(--color-canvas-soft)] p-4 text-left">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-mute)]">
            <span>Total</span>
            <span>
              {confirmation.items.length} producto{confirmation.items.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-[var(--color-ink)]">
            {formatPrice(confirmation.total)}
          </p>
          <p className="mt-2 text-[11px] text-[var(--color-ink-soft)]">
            Pago a la entrega · {tenant.deliveryHours.toLowerCase()}
          </p>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-md border border-brand-900 bg-brand-800 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-100 hover:bg-brand-900"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19.05 4.91A9.92 9.92 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.93 9.93 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02zm-2.49 11.24c-.21.58-1.21 1.11-1.67 1.18-.42.06-.95.08-1.53-.1-.35-.11-.8-.26-1.38-.51-2.42-1.05-4.01-3.5-4.13-3.66-.12-.16-.99-1.32-.99-2.52s.63-1.78.85-2.03c.22-.25.49-.31.65-.31h.48c.15.01.36-.06.56.43.2.5.7 1.72.76 1.84.06.12.1.27.02.43-.09.16-.13.27-.25.41-.13.14-.27.32-.38.43-.13.13-.25.27-.11.51.15.25.64 1.06 1.38 1.72.95.84 1.75 1.1 2 1.23.25.12.4.1.54-.06.15-.16.63-.72.79-.97.17-.25.32-.21.56-.12.22.09 1.44.69 1.69.81.25.12.41.18.47.28.06.11.06.6-.15 1.18z" />
          </svg>
          Enviar copia por WhatsApp
        </a>
        <p className="mt-2 text-[11px] text-[var(--color-ink-mute)]">
          Compartir el pedido por WhatsApp acelera la confirmación.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)] hover:text-brand-700"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
          Tu pedido · {items.length} {items.length === 1 ? "producto" : "productos"}
        </h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <CartLine key={item.productId} item={item} />
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between rounded-md border border-brand-900 bg-brand-800 px-4 py-3 text-accent-100">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Total</span>
          <span className="font-display text-xl font-semibold tabular-nums text-white">
            {formatPrice(total)}
          </span>
        </div>
      </section>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
            Datos de entrega
          </h2>
          {hydrated && customer && (
            <span className="rounded-sm border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
              Rellenado por ti
            </span>
          )}
        </div>

        <Field
          label="Nombre"
          required
          error={errors.customerName}
          input={
            <input
              type="text"
              autoComplete="name"
              value={values.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              placeholder="Marta García"
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
            />
          }
        />
        <Field
          label="Teléfono"
          required
          error={errors.customerPhone}
          input={
            <input
              type="tel"
              autoComplete="tel"
              value={values.customerPhone}
              onChange={(e) => update("customerPhone", e.target.value)}
              placeholder="612 33 44 55"
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
            />
          }
        />
        <Field
          label="Dirección de entrega"
          error={errors.customerAddress}
          hint="Opcional · si recoges en tienda déjalo en blanco"
          input={
            <input
              type="text"
              autoComplete="street-address"
              value={values.customerAddress}
              onChange={(e) => update("customerAddress", e.target.value)}
              placeholder="C/ Aragó 12, local 3 · Barcelona"
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
            />
          }
        />
        <Field
          label="Hora preferida"
          error={errors.preferredTime}
          input={
            <select
              value={values.preferredTime}
              onChange={(e) => update("preferredTime", e.target.value)}
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
            >
              <option value="">Cualquier hora</option>
              <option value="Mañana (8-12 h)">Mañana (8-12 h)</option>
              <option value="Mediodía (12-14 h)">Mediodía (12-14 h)</option>
              <option value="Tarde (16-19 h)">Tarde (16-19 h)</option>
            </select>
          }
        />
        <Field
          label="Notas"
          hint="Opcional · indicaciones para la entrega"
          error={errors.notes}
          input={
            <textarea
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className="w-full resize-none rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-sm focus:border-brand-700 focus:outline-none"
            />
          }
        />

        <button
          type="submit"
          className="mt-2 w-full rounded-md border border-brand-900 bg-brand-800 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-accent-100 transition hover:bg-brand-900 active:scale-[0.997]"
        >
          Confirmar pedido
        </button>
        <p className="text-center text-[11px] text-[var(--color-ink-mute)]">
          {tenant.name} confirma por WhatsApp · pago a la entrega
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  input,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  input: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        {label}
        {required && <span className="text-rose-700">*</span>}
      </span>
      {input}
      {hint && !error && (
        <span className="mt-1 block text-[11px] text-[var(--color-ink-mute)]">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-rose-700">{error}</span>
      )}
    </label>
  );
}
