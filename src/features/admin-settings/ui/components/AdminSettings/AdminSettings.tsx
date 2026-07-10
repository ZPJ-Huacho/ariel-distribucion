"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_SCHEDULE,
  EMPTY_SOCIAL,
  type Settings,
} from "@/core/settings";
import { THEMES, THEME_IDS, type ThemeId } from "@/shared/lib/themes";
import { FEATURES } from "@/shared/lib/feature-flags";
import {
  useSettingsQuery,
  useUpdateSettings,
} from "../../../api/useSettings";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { Textarea } from "@/shared/components/atoms/textarea";
import { cn } from "@/shared/lib/utils";
import { AIUsageCard } from "../AIUsageCard";
import { LogoEditor } from "../LogoEditor";
import { QRShareCard } from "../QRShareCard";
import { ScheduleEditor } from "../ScheduleEditor";
import { SocialLinksEditor } from "../SocialLinksEditor";

const EMPTY: Settings = {
  businessName: "",
  tagline: "",
  heroPhrase: "",
  logoUrl: "",
  logoKey: "",
  whatsappNumber: "",
  address: "",
  schedule: DEFAULT_SCHEDULE,
  social: EMPTY_SOCIAL,
  theme: "default",
  aiEnabled: false,
  aiImagesUsedToday: 0,
  aiUsageResetAt: "",
};

export function AdminSettings() {
  const { data, isLoading } = useSettingsQuery();
  const update = useUpdateSettings();
  const [s, setS] = useState<Settings>(EMPTY);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  const bindText = (k: "businessName" | "tagline" | "heroPhrase" | "whatsappNumber" | "address") => ({
    value: s[k] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setS({ ...s, [k]: e.target.value }),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync(s);
      toast.success("Ajustes guardados");
    } catch {
      toast.error("No pudimos guardar");
    }
  }

  if (isLoading)
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Cargando...
      </div>
    );

  return (
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <div className="xl:columns-2 xl:gap-5 [&>section]:mb-5 [&>section]:break-inside-avoid xl:[&>section:last-child]:mb-0">
      <Section eyebrow="Perfil público" title="Datos del negocio">
        <div className="flex flex-col gap-2">
          <Label htmlFor="businessName">Nombre del negocio</Label>
          <Input id="businessName" {...bindText("businessName")} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tagline">Tagline corto</Label>
          <Input
            id="tagline"
            {...bindText("tagline")}
            placeholder="Ej: Fruta fresca desde el mercado"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="whatsappNumber"
            className="flex items-center justify-between"
          >
            Número WhatsApp
            <span className="text-[10px] font-normal text-muted-foreground">
              incluye prefijo internacional
            </span>
          </Label>
          <Input
            id="whatsappNumber"
            {...bindText("whatsappNumber")}
            placeholder="+34600000000"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="address">Dirección</Label>
          <Textarea id="address" {...bindText("address")} rows={2} />
        </div>
      </Section>

      <Section
        eyebrow="Identidad"
        title="Logo"
        description="Se muestra en el header y el footer. Si no subes ninguno, se muestra solo el nombre del negocio."
      >
        <LogoEditor logoUrl={s.logoUrl ?? ""} />
      </Section>

      <Section
        eyebrow="Portada"
        title="Frase del hero"
        description="Se muestra debajo del título grande del catálogo."
      >
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="heroPhrase"
            className="flex items-center justify-between"
          >
            Frase
            <span className="text-[10px] font-normal text-muted-foreground tabular-nums">
              {(s.heroPhrase ?? "").length}/200
            </span>
          </Label>
          <Textarea
            id="heroPhrase"
            value={s.heroPhrase ?? ""}
            onChange={(e) => setS({ ...s, heroPhrase: e.target.value })}
            maxLength={200}
            rows={2}
            placeholder="Ej: Compra directo de tu mercado de confianza. Sin apps, sin comisiones."
          />
        </div>
      </Section>

      <Section
        eyebrow="Atención"
        title="Horario semanal"
        description="Grupos de días con el mismo horario se agrupan automáticamente en la landing (ej: Lun–Sáb 9:00–21:00)."
      >
        <ScheduleEditor
          value={s.schedule ?? DEFAULT_SCHEDULE}
          onChange={(schedule) => setS({ ...s, schedule })}
        />
      </Section>

      <Section
        eyebrow="Comunidad"
        title="Redes sociales"
        description="Aparecen en el footer del catálogo. Deja vacío el campo si no usas esa red."
      >
        <SocialLinksEditor
          value={s.social ?? EMPTY_SOCIAL}
          onChange={(social) => setS({ ...s, social })}
        />
      </Section>

      <Section
        eyebrow="Difusión"
        title="Compartir catálogo con QR"
        description="Genera y descarga el QR de tu catálogo para pegarlo en tus videos de TikTok, Instagram o carteles."
      >
        <QRShareCard />
      </Section>

      <Section
        eyebrow="IA · Nuevo"
        title="Fotos de producto con IA"
        description="Genera fotos profesionales de tus productos en cajas de madera con tu marca, sin cámara. 15 gratis al día."
      >
        <AIUsageCard
          enabled={s.aiEnabled ?? false}
          used={s.aiImagesUsedToday ?? 0}
          onToggle={(aiEnabled) => setS({ ...s, aiEnabled })}
        />
      </Section>

      {FEATURES.themes && (
        <Section
          eyebrow="Personalización"
          title="Temática"
          description="Elige la festividad activa. Colores, emoji del logo y decoración se aplican automáticamente en el catálogo."
        >
          <ThemePicker
            value={s.theme}
            onChange={(theme) => setS({ ...s, theme })}
          />
        </Section>
      )}

      </div>

      <div className="sticky bottom-20 z-10 mt-2 flex items-center justify-end gap-2 rounded-full border bg-card p-2 shadow-lg md:bottom-4">
        <Button
          type="submit"
          disabled={update.isPending}
          className="rounded-full px-6"
        >
          {update.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {THEME_IDS.map((id) => {
        const t = THEMES[id];
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "group relative flex flex-col gap-2 rounded-lg border p-3 text-left transition-all",
              active
                ? "border-primary ring-2 ring-primary/40"
                : "border-border hover:bg-muted/50",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-md text-lg"
                style={{ background: t.primaryColor, color: "#fff" }}
              >
                {t.emoji}
              </span>
              <p className="text-sm font-semibold">{t.label}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              {t.description}
            </p>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.mode === "dark" ? "modo oscuro" : "modo claro"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
