"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  CircleCheck,
  Clock,
  MapPin,
  MessageCircle,
  Minus,
  NotebookPen,
  Pencil,
  Phone,
  Plus,
  ShoppingCart,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import type { CartItem } from "@/shared/lib/cart-store";
import { createOrderSchema } from "@/core/orders";
import { useCart } from "@/shared/lib/cart-store";
import { useSettings } from "@/shared/providers/SettingsProvider";
import { useCurrentUser } from "@/shared/providers/UserProvider";
import { useProfile } from "@/features/profile/api/useProfile";
import { buildOrderMessage, buildWhatsAppLink } from "../../lib/whatsapp";
import { useCreateOrder } from "../../../api/useCreateOrder";
import { formatPrice } from "@/shared/lib/format";
import { toUiMessage } from "@/shared/lib/errors";
import { Button, buttonVariants } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { Textarea } from "@/shared/components/atoms/textarea";
import { cn } from "@/shared/lib/utils";

export function OrderForm() {
  const router = useRouter();
  const settings = useSettings();
  const items = useCart((c) => c.items);
  const update = useCart((c) => c.update);
  const remove = useCart((c) => c.remove);
  const clear = useCart((c) => c.clear);
  const total = items.reduce((n, i) => n + i.quantity * i.price, 0);
  const totalItems = items.reduce((n, i) => n + i.quantity, 0);
  const createOrder = useCreateOrder();

  const sessionUser = useCurrentUser();
  const { data: profile } = useProfile();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [override, setOverride] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    if (!profile) return;
    hydratedRef.current = true;
    setCustomerName(profile.name);
    setCustomerPhone(profile.phone ?? "");
    setCustomerAddress(profile.address ?? "");
    setPreferredTime(profile.preferredDeliveryTime ?? "");
  }, [profile]);

  if (!items.length) return <EmptyCart />;

  async function submit() {
    const draft = {
      customerName,
      customerPhone,
      customerAddress: customerAddress || undefined,
      preferredTime: preferredTime || undefined,
      notes: notes || undefined,
      source: "web",
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        price: i.price,
      })),
    };
    const parsed = createOrderSchema.safeParse(draft);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos incompletos");
      return;
    }
    try {
      await createOrder.mutateAsync(parsed.data);
      const message = buildOrderMessage(
        items,
        { ...parsed.data, source: "web" },
        settings,
      );
      const link = buildWhatsAppLink(message, settings.whatsappNumber);
      clear();
      toast.success("Pedido registrado. Abriendo WhatsApp...");
      window.location.href = link;
      router.refresh();
    } catch (err) {
      toast.error(
        toUiMessage(err, "No pudimos registrar el pedido. Intenta de nuevo."),
      );
    }
  }

  const isLoggedIn = !!sessionUser;
  const hasProfileData = isLoggedIn && !!profile;
  const showAsEditable = !isLoggedIn || override;

  return (
    <>
      <div className="grid gap-5 pb-24 lg:grid-cols-[1fr_400px] lg:gap-8 lg:pb-0">
        <div className="flex flex-col gap-5">
          <CartItemsCard items={items} onUpdate={update} onRemove={remove} />

          {hasProfileData && !override ? (
            <ContactSummaryCard
              name={customerName}
              phone={customerPhone}
              address={customerAddress}
              preferredTime={preferredTime}
              onOverride={() => setOverride(true)}
            />
          ) : (
            <ContactFormCard
              name={customerName}
              phone={customerPhone}
              address={customerAddress}
              preferredTime={preferredTime}
              isLoggedIn={isLoggedIn}
              override={override}
              onName={setCustomerName}
              onPhone={setCustomerPhone}
              onAddress={setCustomerAddress}
              onPreferredTime={setPreferredTime}
              onRestore={
                hasProfileData
                  ? () => {
                      if (!profile) return;
                      setCustomerName(profile.name);
                      setCustomerPhone(profile.phone ?? "");
                      setCustomerAddress(profile.address ?? "");
                      setPreferredTime(profile.preferredDeliveryTime ?? "");
                      setOverride(false);
                    }
                  : undefined
              }
            />
          )}

          <OrderNotesCard notes={notes} onNotes={setNotes} />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <SummaryCard total={total} count={totalItems} />

          <div className="hidden flex flex-col gap-2 lg:block">
            <Button
              className="h-12 w-full text-base"
              size="lg"
              onClick={submit}
              disabled={createOrder.isPending || !settings.whatsappNumber}
            >
              <MessageCircle className="mr-2 h-5 w-5" aria-hidden />
              {createOrder.isPending
                ? "Enviando..."
                : "Confirmar por WhatsApp"}
            </Button>
            {!settings.whatsappNumber ? (
              <p className="text-center text-xs text-destructive">
                Falta configurar el WhatsApp en Ajustes.
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Al confirmar abrimos WhatsApp con el mensaje del pedido listo
                para enviar.
              </p>
            )}
          </div>
        </aside>
      </div>

      <StickyCta
        total={total}
        count={totalItems}
        pending={createOrder.isPending}
        disabled={!settings.whatsappNumber}
        onSubmit={submit}
      />
    </>
  );
}

function EmptyCart() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-primary/15 px-6 py-14 text-center shadow-sm sm:py-20"
      style={{
        background: `radial-gradient(120% 100% at 50% 0%,
          color-mix(in oklch, var(--primary) 10%, var(--card)) 0%,
          var(--card) 70%)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 60%, transparent) 0%, transparent 70%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 50%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-6">
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 -m-3 rounded-full bg-primary/10 blur-xl"
          />
          <div
            aria-hidden
            className="relative grid h-20 w-20 place-items-center rounded-full border border-primary/25 bg-background/70 text-primary shadow-inner backdrop-blur sm:h-24 sm:w-24"
          >
            <ShoppingCart className="h-9 w-9 sm:h-10 sm:w-10" />
          </div>
          <span
            aria-hidden
            className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-md"
          >
            0
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h3 className="font-display text-2xl sm:text-3xl">
            Tu carrito está <span className="text-primary">vacío</span>
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground sm:text-base">
            Explora el catálogo y añade productos para empezar a armar tu pedido.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-11 gap-2 rounded-full px-6 shadow-lg shadow-primary/25",
            )}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Ir al catálogo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/#catalogo"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 rounded-full px-6",
            )}
          >
            Ver categorías
          </Link>
        </div>

        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
          Sin apps · Sin comisiones · Pedido en minutos
        </p>
      </div>
    </div>
  );
}

function CartItemsCard({
  items,
  onUpdate,
  onRemove,
}: {
  items: CartItem[];
  onUpdate: (id: string, q: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingCart className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Productos del pedido</h2>
            <p className="text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "producto" : "productos"} en
              el carrito
            </p>
          </div>
        </div>
      </header>

      <ul className="divide-y divide-border">
        {items.map((i) => (
          <li
            key={i.productId}
            className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 md:px-8"
          >
            <div
              className={cn(
                "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-3xl sm:h-16 sm:w-16",
                i.gradient
                  ? `bg-gradient-to-br ${i.gradient}`
                  : "bg-muted",
              )}
              aria-hidden
            >
              {i.imageUrl ? (
                <Image
                  src={i.imageUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span>{i.emoji || "🛒"}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium sm:text-base">
                {i.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatPrice(i.price)} · {i.unit}
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {formatPrice(i.price * i.quantity)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex items-center rounded-full border bg-background">
                <button
                  type="button"
                  onClick={() => onUpdate(i.productId, i.quantity - 1)}
                  aria-label="Restar uno"
                  className="flex h-8 w-8 items-center justify-center rounded-l-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span
                  className="w-8 text-center text-sm font-semibold"
                  aria-live="polite"
                >
                  {i.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdate(i.productId, i.quantity + 1)}
                  aria-label="Sumar uno"
                  className="flex h-8 w-8 items-center justify-center rounded-r-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i.productId)}
                aria-label={`Quitar ${i.name}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" aria-hidden />
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactSummaryCard({
  name,
  phone,
  address,
  preferredTime,
  onOverride,
}: {
  name: string;
  phone: string;
  address: string;
  preferredTime: string;
  onOverride: () => void;
}) {
  const rows = [
    { icon: UserIcon, label: "Nombre", value: name || "—" },
    { icon: Phone, label: "Teléfono", value: phone || "—" },
    { icon: MapPin, label: "Dirección", value: address || "Sin definir" },
    {
      icon: Clock,
      label: "Horario preferido",
      value: preferredTime || "Cualquier momento",
    },
  ];
  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserIcon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Datos de contacto</h2>
              <p className="text-xs text-muted-foreground">
                Vienen de tu perfil.
              </p>
            </div>
          </div>
          <Link
            href="/perfil"
            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Pencil className="h-3 w-3" aria-hidden />
            Editar en perfil
          </Link>
        </div>
      </header>

      <dl className="divide-y divide-border">
        {rows.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-start gap-3 px-4 py-3 sm:px-6 md:px-8"
          >
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted/60 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-0.5 truncate text-sm">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="border-t px-4 py-3 sm:px-6 md:px-8">
        <button
          type="button"
          onClick={onOverride}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Usar otros datos solo para este pedido
        </button>
      </div>
    </div>
  );
}

function ContactFormCard(props: {
  name: string;
  phone: string;
  address: string;
  preferredTime: string;
  isLoggedIn: boolean;
  override: boolean;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onAddress: (v: string) => void;
  onPreferredTime: (v: string) => void;
  onRestore?: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserIcon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold">
                {props.override
                  ? "Datos para este pedido"
                  : "Tus datos"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {props.override
                  ? "Solo se usarán en este pedido. Tu perfil no cambia."
                  : "Los usaremos para confirmar y entregar tu pedido."}
              </p>
            </div>
          </div>
          {props.onRestore && (
            <button
              type="button"
              onClick={props.onRestore}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
            >
              Usar datos del perfil
            </button>
          )}
        </div>

        {!props.isLoggedIn && (
          <div className="mt-3 rounded-md bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
            <Link
              href="/login?next=/pedido"
              className="font-medium text-primary hover:underline"
            >
              Entra
            </Link>{" "}
            o{" "}
            <Link
              href="/registro"
              className="font-medium text-primary hover:underline"
            >
              regístrate
            </Link>{" "}
            para autocompletar tus datos la próxima vez.
          </div>
        )}
      </header>

      <div className="flex flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 md:px-8 md:py-7">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="o-name">Nombre</Label>
            <div className="relative">
              <UserIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="o-name"
                autoComplete="name"
                value={props.name}
                onChange={(e) => props.onName(e.target.value)}
                className="h-10 pl-9"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="o-phone">Teléfono</Label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="o-phone"
                inputMode="tel"
                autoComplete="tel"
                value={props.phone}
                onChange={(e) => props.onPhone(e.target.value)}
                className="h-10 pl-9"
                placeholder="+34600000000"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="o-address"
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <MapPin
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
              Dirección
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              opcional
            </span>
          </Label>
          <Textarea
            id="o-address"
            autoComplete="street-address"
            value={props.address}
            onChange={(e) => props.onAddress(e.target.value)}
            rows={2}
            placeholder="Calle, número, piso, ciudad..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="o-time"
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Clock
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
              Horario preferido
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              opcional
            </span>
          </Label>
          <Input
            id="o-time"
            value={props.preferredTime}
            onChange={(e) => props.onPreferredTime(e.target.value)}
            className="h-10"
            placeholder="Mañana temprano, tarde..."
          />
        </div>
      </div>
    </div>
  );
}

function OrderNotesCard({
  notes,
  onNotes,
}: {
  notes: string;
  onNotes: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <NotebookPen className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Notas del pedido</h2>
            <p className="text-xs text-muted-foreground">
              Alergias, timbre roto, indicaciones especiales…
            </p>
          </div>
        </div>
      </header>
      <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
        <Textarea
          id="o-notes"
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={3}
          placeholder="Cuéntanos cualquier detalle relevante para la entrega."
        />
      </div>
    </div>
  );
}

function SummaryCard({ total, count }: { total: number; count: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-gradient-to-br from-primary/5 to-background p-5 shadow-sm sm:p-6 md:p-7">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        <CircleCheck className="h-3.5 w-3.5" aria-hidden />
        Resumen
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {count} {count === 1 ? "unidad" : "unidades"}
        </span>
        <span>{formatPrice(total)}</span>
      </div>
      <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
        <span className="text-sm font-semibold uppercase tracking-wide">
          Total
        </span>
        <span className="text-2xl font-bold text-primary">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}

function StickyCta({
  total,
  count,
  pending,
  disabled,
  onSubmit,
}: {
  total: number;
  count: number;
  pending: boolean;
  disabled: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:px-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {count} {count === 1 ? "unidad" : "unidades"}
          </p>
          <p className="truncate text-lg font-bold text-primary">
            {formatPrice(total)}
          </p>
        </div>
        <Button
          className="h-12 flex-1 gap-2 rounded-full text-sm"
          size="lg"
          onClick={onSubmit}
          disabled={pending || disabled}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {pending ? "Enviando..." : "Confirmar"}
        </Button>
      </div>
    </div>
  );
}
