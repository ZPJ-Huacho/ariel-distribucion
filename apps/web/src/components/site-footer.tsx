import Link from "next/link";
import { MessageCircle, MapPin, Mail, Clock, Sprout } from "lucide-react";
import { tenant } from "@/lib/data/tenant";

export function SiteFooter() {
  const waLink = `https://wa.me/${tenant.whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <footer className="mt-20 border-t border-border/60 bg-card/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
                aria-hidden
              >
                <Sprout className="h-4.5 w-4.5" />
              </span>
              <p className="text-[15px] font-semibold tracking-tight text-foreground">
                {tenant.name}
              </p>
            </div>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
              Fruta y verdura seleccionada en lonja a primera hora. Entregamos
              en el día a restaurantes y familias de toda Barcelona.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Tienda
            </h3>
            <ul className="space-y-2 text-[13.5px]">
              <FooterLink href="/">Catálogo</FooterLink>
              <FooterLink href="/?cat=frutas">Frutas</FooterLink>
              <FooterLink href="/?cat=verduras">Verduras</FooterLink>
              <FooterLink href="/?cat=tropical">Tropical</FooterLink>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Contacto
            </h3>
            <ul className="space-y-2.5 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{tenant.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{tenant.deliveryHours}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground transition hover:text-primary"
                >
                  {tenant.whatsappNumber}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <a
                  href="mailto:hola@frutasdelmercat.com"
                  className="text-foreground transition hover:text-primary"
                >
                  hola@frutasdelmercat.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-[12px] text-muted-foreground sm:flex-row sm:items-center lg:px-6">
          <p>
            © {new Date().getFullYear()} {tenant.name}. Producto de Mercabarna,
            Barcelona.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="transition hover:text-foreground">
              Acceder
            </Link>
            <Link href="/admin" className="transition hover:text-foreground">
              Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
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
        className="text-muted-foreground transition hover:text-foreground"
      >
        {children}
      </Link>
    </li>
  );
}
