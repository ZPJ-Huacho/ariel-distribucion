import type { MetadataRoute } from "next";
import { GetSettingsUseCase, getSettingsRepository } from "@/core/settings";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await new GetSettingsUseCase(getSettingsRepository()).execute();
  const description =
    s.heroPhrase ||
    s.tagline ||
    `Catálogo de ${s.businessName}. Pide directo por WhatsApp.`;

  return {
    name: s.businessName,
    short_name: s.businessName.slice(0, 12),
    description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0C3B3B",
    theme_color: "#0C3B3B",
    lang: "es-ES",
    dir: "ltr",
    categories: ["food", "shopping", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
