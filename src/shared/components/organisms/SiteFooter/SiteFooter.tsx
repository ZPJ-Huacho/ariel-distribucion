"use client";

import Link from "next/link";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { useSettings } from "@/shared/providers/SettingsProvider";
import { getActiveTheme } from "@/shared/lib/themes";
import { SVG_ASSETS } from "@/shared/assets/svg";
import { ScheduleDisplay } from "@/shared/components/organisms/ScheduleDisplay";

const SOCIAL_META = [
  { key: "instagram", label: "Instagram", src: SVG_ASSETS.instagram },
  { key: "facebook", label: "Facebook", src: SVG_ASSETS.facebook },
  { key: "tiktok", label: "TikTok", src: SVG_ASSETS.tiktok },
  { key: "youtube", label: "YouTube", src: SVG_ASSETS.youtube },
  { key: "twitter", label: "X", src: SVG_ASSETS.twitter },
] as const;

export function SiteFooter() {
  const s = useSettings();
  const theme = getActiveTheme(s.theme);
  const waLink = s.whatsappNumber
    ? `https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, "")}`
    : null;
  const socials = SOCIAL_META.filter(
    (n) => (s.social?.[n.key] ?? "").trim().length > 0,
  );
  const hasSchedule = s.schedule && Object.keys(s.schedule).length > 0;

  return (
    <footer className="mt-24 bg-neutral-950 text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.logoUrl || SVG_ASSETS.logoHorizontal}
              alt=""
              aria-hidden
              className="h-10 w-auto max-w-[140px] object-contain"
            />
            <p className="text-lg font-semibold text-white">
              {s.businessName}
            </p>
          </div>
          {s.heroPhrase && (
            <p className="text-sm leading-relaxed text-white/70">
              {s.heroPhrase}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Explora
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            <FooterNavLink href="/">Catálogo</FooterNavLink>
            <FooterNavLink href="/pedido">Mi pedido</FooterNavLink>
            <FooterNavLink href="/perfil">Mi perfil</FooterNavLink>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Contacto
          </p>
          <ul className="flex flex-col gap-3 text-sm">
            {s.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/60" />
                <span>{s.address}</span>
              </li>
            )}
            {hasSchedule && (
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/60" />
                <ScheduleDisplay
                  schedule={s.schedule}
                  variant="list"
                  className="text-xs text-white/70"
                />
              </li>
            )}
            {waLink && (
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SVG_ASSETS.whatsapp}
                    alt=""
                    className="h-4 w-4 shrink-0"
                  />
                  <span className="tabular-nums">{s.whatsappNumber}</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Síguenos
          </p>
          {socials.length === 0 && !waLink ? (
            <p className="text-xs text-white/40">
              Aún no hay redes configuradas.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition-all hover:bg-white/15 hover:ring-white/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SVG_ASSETS.whatsapp}
                    alt=""
                    className="h-6 w-6 object-contain"
                  />
                </a>
              )}
              {socials.map(({ key, label, src }) => (
                <a
                  key={key}
                  href={s.social?.[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition-all hover:bg-white/15 hover:ring-white/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-6 w-6 object-contain"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-white/40 lg:px-6">
          © {new Date().getFullYear()} {s.businessName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

function FooterNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 rounded-md py-1 text-white/75 transition-colors hover:text-white"
      >
        <ChevronRight
          className="h-3.5 w-3.5 text-primary/70 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
        {children}
      </Link>
    </li>
  );
}
