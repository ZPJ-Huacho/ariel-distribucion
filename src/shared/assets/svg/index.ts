/**
 * Mapa de assets SVG servidos como archivos estáticos desde `/public/theme/`.
 *
 * Cada entrada apunta a un archivo que también tiene una copia
 * "editable" en `src/shared/assets/svg/*.svg` como fuente de verdad.
 * Mantenerlos sincronizados: si editas la fuente, cópiala a `public/theme/`.
 *
 * Uso desde un componente:
 *   import { SVG_ASSETS } from "@/shared/assets/svg";
 *   <img src={SVG_ASSETS.christmasHat} alt="" />
 */
export const SVG_ASSETS = {
  christmasHat: "/theme/christmas-hat.svg",
  instagram: "/theme/instragram.svg",
  facebook: "/theme/facebook.svg",
  tiktok: "/theme/tiktok.svg",
  twitter: "/theme/twitter.svg",
  youtube: "/theme/youtube.svg",
  whatsapp: "/theme/whatsapp.svg",
  logoHorizontal: "/theme/logo-horizontal.svg",
  logoMark: "/theme/logo-mark.svg",
} as const;

export type SvgAssetKey = keyof typeof SVG_ASSETS;
