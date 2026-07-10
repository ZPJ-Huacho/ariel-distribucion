/**
 * Feature flags de la app. Cambia el valor a `true` para activar el feature
 * en todo el sitio. Poner false desactiva completamente su UI y su lógica.
 */
export const FEATURES = {
  /**
   * Sistema de temáticas festivas (Navidad, Halloween, Sant Jordi, etc.).
   * Cuando es `false`:
   *   - `getActiveTheme()` siempre devuelve el tema `default`.
   *   - No se aplica modo dark ni tinte del tema.
   *   - No se muestra el `ThemeBanner`.
   *   - No aparece la gorra navideña ni ningún decorativo por festividad.
   *   - En `/admin/ajustes` se oculta el selector de temáticas.
   */
  themes: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
