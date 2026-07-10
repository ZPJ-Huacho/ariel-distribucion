import { toOpeningHoursSpec, type Settings } from "@/core/settings";

/**
 * JSON-LD para SEO + GEO (SGE, ChatGPT, Perplexity).
 *
 * Renderiza un LocalBusiness / FoodEstablishment con:
 * - Nombre, descripción, URL, logo
 * - Teléfono (WhatsApp)
 * - Dirección
 * - Horarios (agrupados por Schema.org)
 * - Redes sociales (sameAs)
 *
 * Se sirve inline en el <body> para que crawlers lo lean sin ejecutar JS.
 */
export function StructuredData({
  settings,
  origin,
}: {
  settings: Settings;
  origin: string;
}) {
  const social = settings.social ?? {};
  const sameAs = [
    social.instagram,
    social.facebook,
    social.tiktok,
    social.youtube,
    social.twitter,
  ].filter((v): v is string => !!v && v.trim().length > 0);

  const logoUrl = settings.logoUrl?.startsWith("http")
    ? settings.logoUrl
    : `${origin}${settings.logoUrl || "/icon.svg"}`;

  const openingHours = settings.schedule
    ? toOpeningHoursSpec(settings.schedule)
    : [];

  const telephone = settings.whatsappNumber
    ? settings.whatsappNumber.replace(/[^0-9+]/g, "")
    : undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${origin}/#business`,
    name: settings.businessName,
    description:
      settings.heroPhrase ||
      settings.tagline ||
      `Catálogo de ${settings.businessName}`,
    url: origin,
    image: logoUrl,
    logo: logoUrl,
    priceRange: "€€",
    servesCuisine: "Fresh produce",
  };

  if (telephone) jsonLd.telephone = telephone;
  if (settings.address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "ES",
    };
  }
  if (openingHours.length > 0) jsonLd.openingHoursSpecification = openingHours;
  if (sameAs.length > 0) jsonLd.sameAs = sameAs;
  if (settings.tagline) jsonLd.slogan = settings.tagline;

  return (
    <script
      type="application/ld+json"
      // Safe: se serializa como JSON (sin scripts inyectables)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
