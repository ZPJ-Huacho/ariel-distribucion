export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
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

const sourceLabels: Record<string, { label: string; emoji: string; tone: string }> = {
  tiktok: { label: "TikTok", emoji: "🎵", tone: "bg-fuchsia-100 text-fuchsia-700" },
  instagram: { label: "Instagram", emoji: "📸", tone: "bg-pink-100 text-pink-700" },
  whatsapp: { label: "WhatsApp", emoji: "💬", tone: "bg-emerald-100 text-emerald-700" },
  google: { label: "Google", emoji: "🔎", tone: "bg-sky-100 text-sky-700" },
  direct: { label: "Directo", emoji: "🌐", tone: "bg-slate-100 text-slate-700" },
};

export function getSourceMeta(source: string) {
  return sourceLabels[source] ?? { label: source, emoji: "🔗", tone: "bg-slate-100 text-slate-700" };
}
