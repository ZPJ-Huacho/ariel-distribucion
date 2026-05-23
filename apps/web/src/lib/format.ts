export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function pricePerKg(unit: string, price: number): string | null {
  const match = unit.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (!match) return null;
  const kg = parseFloat(match[1].replace(",", "."));
  if (!kg || kg <= 0) return null;
  const perKg = price / kg;
  const formatted = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(perKg);
  return `${formatted}/kg`;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "ahora mismo";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

const sourceLabels: Record<string, { label: string; initial: string; tone: string }> = {
  tiktok: { label: "TikTok", initial: "TT", tone: "bg-stone-900 text-white" },
  instagram: { label: "Instagram", initial: "IG", tone: "bg-rose-900 text-rose-50" },
  whatsapp: { label: "WhatsApp", initial: "WA", tone: "bg-emerald-800 text-emerald-50" },
  google: { label: "Google", initial: "G", tone: "bg-sky-900 text-sky-50" },
  direct: { label: "Directo", initial: "·", tone: "bg-[var(--color-canvas-soft)] text-[var(--color-ink-soft)]" },
};

export function getSourceMeta(source: string) {
  return (
    sourceLabels[source] ?? {
      label: source,
      initial: source.slice(0, 2).toUpperCase(),
      tone: "bg-[var(--color-canvas-soft)] text-[var(--color-ink-soft)]",
    }
  );
}
