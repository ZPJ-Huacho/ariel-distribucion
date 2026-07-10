"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, Sparkles, Star } from "lucide-react";
import { useSettings } from "@/shared/providers/SettingsProvider";
import { getActiveTheme } from "@/shared/lib/themes";
import { buttonVariants } from "@/shared/components/atoms/button";
import { cn } from "@/shared/lib/utils";
import heroImage from "@/shared/assets/images/furgoneta.png";

export function Hero() {
  const s = useSettings();
  const theme = getActiveTheme(s.theme);
  const [firstWord, ...restWords] = s.businessName.split(" ");
  const rest = restWords.join(" ");

  return (
    <section
      aria-label="Portada"
      className="relative isolate -mt-16 overflow-hidden rounded-b-[2.5rem] bg-neutral-950 text-white"
    >
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_center] sm:object-[60%_center] lg:object-center"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 90%, color-mix(in oklch, var(--primary) 40%, transparent) 0%, transparent 55%), radial-gradient(80% 60% at 90% 10%, color-mix(in oklch, var(--primary) 25%, transparent) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative mx-auto flex min-h-[560px] w-full max-w-6xl flex-col justify-end gap-6 px-5 pb-14 pt-24 md:min-h-[620px] md:justify-center md:gap-7 md:px-6 md:pb-16 md:pt-32 lg:min-h-[680px] lg:pb-20">
        <span className="inline-flex w-fit items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          {theme.id === "default" ? "Producto fresco cada día" : theme.label}
        </span>

        <h1 className="max-w-xl font-display text-4xl leading-[1.02] tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block text-white/85">
            {firstWord}
            {!rest && <span className="text-primary">.</span>}
          </span>
          {rest && (
            <span className="block text-white">
              {rest}
              <span className="text-primary">.</span>
            </span>
          )}
        </h1>

        <p className="max-w-md text-sm text-white/80 drop-shadow sm:text-base lg:text-lg">
          {s.heroPhrase ||
            s.tagline ||
            "Compra directo de tu mercado de confianza. Sin apps, sin comisiones, listo en minutos."}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="#catalogo"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-11 rounded-full px-5 text-sm font-semibold shadow-lg shadow-primary/30 sm:h-12 sm:px-6",
            )}
          >
            Ver productos <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          <Link
            href="/pedido"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "h-11 rounded-full border border-white/25 bg-white/5 px-5 text-sm text-white backdrop-blur hover:bg-white/15 hover:text-white sm:h-12 sm:px-6",
            )}
          >
            Cómo pedir
          </Link>
        </div>

        <dl className="grid max-w-md grid-cols-3 gap-4 pt-4 sm:pt-6">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
              Clientes
            </dt>
            <dd className="mt-1 flex items-baseline gap-1 font-display text-xl text-white drop-shadow sm:text-2xl">
              500<span className="text-primary">+</span>
            </dd>
          </div>
          <div className="border-x border-white/15 px-4">
            <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
              Rating
            </dt>
            <dd className="mt-1 flex items-baseline gap-1 font-display text-xl text-white drop-shadow sm:text-2xl">
              4.9
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
              Entrega
            </dt>
            <dd className="mt-1 flex items-baseline gap-1 font-display text-xl text-white drop-shadow sm:text-2xl">
              24h
            </dd>
          </div>
        </dl>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center md:flex">
        <span className="inline-flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
          <span>Descubre</span>
          <ArrowDown className="h-3 w-3 animate-bounce" aria-hidden />
        </span>
      </div>
    </section>
  );
}
