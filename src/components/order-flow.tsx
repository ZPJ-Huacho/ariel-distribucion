"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useCart, cartTotal } from "@/lib/cart-store";
import { CartLine } from "@/components/cart-line";
import { formatPrice } from "@/lib/format";
import { tenant } from "@/lib/data/tenant";
import { buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { getCurrentSource } from "@/lib/source-tracking";

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

export function OrderFlow() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const total = cartTotal(items);

  const [values, setValues] = useState<FormValues>({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    preferredTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [confirmation, setConfirmation] = useState<{ link: string; msg: string } | null>(null);

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
    const msg = buildOrderMessage(items, { ...parsed.data, source }, tenant);
    const link = buildWhatsAppLink(msg, tenant.whatsappNumber);
    setConfirmation({ link, msg });
  }

  if (items.length === 0 && !confirmation) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
        <div className="mb-4 text-5xl" aria-hidden>🛒</div>
        <h2 className="text-lg font-semibold text-stone-900">Tu cesta está vacía</h2>
        <p className="mt-1 text-sm text-stone-500">Vuelve al catálogo y añade los productos que quieras.</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-stone-900">¡Pedido listo para enviar!</h2>
        <p className="mt-1.5 text-sm text-stone-600">
          Pulsa el botón de abajo para mandárselo a {tenant.name} por WhatsApp. Te contestarán en minutos para confirmar y entregar.
        </p>
        <a
          href={confirmation.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => clear()}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19.05 4.91A9.92 9.92 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.93 9.93 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02zm-2.49 11.24c-.21.58-1.21 1.11-1.67 1.18-.42.06-.95.08-1.53-.1-.35-.11-.8-.26-1.38-.51-2.42-1.05-4.01-3.5-4.13-3.66-.12-.16-.99-1.32-.99-2.52s.63-1.78.85-2.03c.22-.25.49-.31.65-.31h.48c.15.01.36-.06.56.43.2.5.7 1.72.76 1.84.06.12.1.27.02.43-.09.16-.13.27-.25.41-.13.14-.27.32-.38.43-.13.13-.25.27-.11.51.15.25.64 1.06 1.38 1.72.95.84 1.75 1.1 2 1.23.25.12.4.1.54-.06.15-.16.63-.72.79-.97.17-.25.32-.21.56-.12.22.09 1.44.69 1.69.81.25.12.41.18.47.28.06.11.06.6-.15 1.18z" />
          </svg>
          Enviar a WhatsApp
        </a>
        <p className="mt-4 text-xs text-stone-500">
          Tras enviarlo, tu cesta se vacía automáticamente.{" "}
          <Link href="/" className="font-semibold text-brand-700 hover:underline">
            Volver al catálogo
          </Link>
        </p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs font-medium text-stone-500">Ver el mensaje que se envía</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-xs text-stone-700 ring-1 ring-stone-200">{confirmation.msg}</pre>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Tu pedido ({items.length} {items.length === 1 ? "producto" : "productos"})
        </h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <CartLine key={item.productId} item={item} />
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-stone-900 px-4 py-3 text-white">
          <span className="text-sm font-medium">Total</span>
          <span className="text-xl font-bold">{formatPrice(total)}</span>
        </div>
      </section>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Tus datos
        </h2>

        <Field
          label="Tu nombre"
          required
          error={errors.customerName}
          input={
            <input
              type="text"
              autoComplete="name"
              value={values.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              placeholder="Marta García"
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
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
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
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
              placeholder="C/ ejemplo 12, 3º 1ª"
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
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
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
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
          hint="Opcional · ej: pisar 3º, llamar al llegar..."
          error={errors.notes}
          input={
            <textarea
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm focus:border-brand-600 focus:outline-none"
            />
          }
        />

        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-brand-600 py-4 text-base font-bold text-white shadow-md transition hover:bg-brand-700 active:scale-[0.99]"
        >
          Continuar a WhatsApp
        </button>
        <p className="text-center text-[11px] text-stone-500">
          Confirmamos por WhatsApp y entregamos en el día. Pago en efectivo a la entrega.
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
      <span className="mb-1 flex items-center gap-1 px-1 text-sm font-medium text-stone-800">
        {label}
        {required && <span className="text-rose-600">*</span>}
      </span>
      {input}
      {hint && !error && <span className="mt-1 block px-1 text-[11px] text-stone-500">{hint}</span>}
      {error && <span className="mt-1 block px-1 text-[11px] font-medium text-rose-600">{error}</span>}
    </label>
  );
}
