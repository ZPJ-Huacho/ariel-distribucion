import Link from "next/link";
import { tenant } from "@/lib/data/tenant";

export function SiteFooter() {
  const waLink = `https://wa.me/${tenant.whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <footer className="mt-16 border-t border-[var(--color-canvas-deep)] bg-[var(--color-canvas-deep)] text-[var(--color-line-soft)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-md border border-brand-600 bg-brand-700 font-display text-base font-semibold tracking-tight text-accent-100"
              aria-hidden
            >
              FM
            </span>
            <div>
              <p className="font-display text-[16px] text-white">{tenant.name}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-accent-200">
                Mayorista · Mercabarna
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-[var(--color-line-soft)]/80">
            Fruta y verdura seleccionada en lonja a primera hora. Entregamos en
            el día a restaurantes y familias de toda Barcelona.
          </p>
        </div>

        <FooterCol title="Tienda">
          <FooterLink href="/">Catálogo</FooterLink>
          <FooterLink href="/?cat=frutas">Frutas</FooterLink>
          <FooterLink href="/?cat=verduras">Verduras</FooterLink>
          <FooterLink href="/?cat=tropical">Tropical</FooterLink>
          <FooterLink href="/pedido">Mi pedido</FooterLink>
        </FooterCol>

        <FooterCol title="Contacto">
          <FooterRow label="Dirección">{tenant.address}</FooterRow>
          <FooterRow label="WhatsApp">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-accent-200"
            >
              {tenant.whatsappNumber}
            </a>
          </FooterRow>
          <FooterRow label="Email">
            <a
              href="mailto:hola@frutasdelmercat.com"
              className="text-white hover:text-accent-200"
            >
              hola@frutasdelmercat.com
            </a>
          </FooterRow>
        </FooterCol>

        <FooterCol title="Horario">
          <FooterRow label="Atención">{tenant.deliveryHours}</FooterRow>
          <FooterRow label="Domingos">Cerrado</FooterRow>
          <div className="mt-2 flex gap-2">
            <SocialLink
              label="WhatsApp"
              href={waLink}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.05 4.91A9.92 9.92 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.93 9.93 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02zM12.04 20.15a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.25 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.71 2.61 4.13 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28z" />
                </svg>
              }
            />
            <SocialLink
              label="TikTok"
              href="https://www.tiktok.com/@ariel1.rm"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.6 6.3a4.7 4.7 0 0 1-3.3-1.5 4.7 4.7 0 0 1-1.4-2.8h-3.4v12.4a2.5 2.5 0 1 1-2.5-2.5c.3 0 .6.1.9.2v-3.4a6 6 0 0 0-.9-.1A5.9 5.9 0 1 0 14.9 14V8.2a8 8 0 0 0 4.7 1.5z" />
                </svg>
              }
            />
          </div>
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-[11px] text-[var(--color-line-soft)]/60 sm:flex-row sm:items-center lg:px-6">
          <p>
            © {new Date().getFullYear()} {tenant.name}. Producto de
            Mercabarna, Barcelona.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-accent-200">
              Acceder
            </Link>
            <Link href="/admin" className="hover:text-accent-200">
              Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-200">
        {title}
      </h3>
      <ul className="space-y-2 text-[13px]">{children}</ul>
    </div>
  );
}

function FooterLink({
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
        className="text-[var(--color-line-soft)]/80 transition hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}

function FooterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <span className="block text-[10px] uppercase tracking-[0.14em] text-[var(--color-line-soft)]/50">
        {label}
      </span>
      <span className="block">{children}</span>
    </li>
  );
}

function SocialLink({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/15 text-[var(--color-line-soft)] transition hover:border-accent-200 hover:text-accent-200"
    >
      {icon}
    </a>
  );
}
