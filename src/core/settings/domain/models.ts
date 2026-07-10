import { z } from "zod";
import { THEME_IDS, type ThemeId } from "@/shared/lib/themes";

export const DAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

export const DAY_SHORT: Record<DayKey, string> = {
  mon: "Lun",
  tue: "Mar",
  wed: "Mié",
  thu: "Jue",
  fri: "Vie",
  sat: "Sáb",
  sun: "Dom",
};

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const dayHoursSchema = z.object({
  closed: z.boolean().default(false),
  open: z.string().regex(timeRegex).default("09:00"),
  close: z.string().regex(timeRegex).default("18:00"),
});
export type DayHours = z.infer<typeof dayHoursSchema>;

export const weekScheduleSchema = z.object({
  mon: dayHoursSchema,
  tue: dayHoursSchema,
  wed: dayHoursSchema,
  thu: dayHoursSchema,
  fri: dayHoursSchema,
  sat: dayHoursSchema,
  sun: dayHoursSchema,
});
export type WeekSchedule = z.infer<typeof weekScheduleSchema>;

export const socialLinksSchema = z.object({
  instagram: z.string().url().or(z.literal("")).optional().default(""),
  facebook: z.string().url().or(z.literal("")).optional().default(""),
  tiktok: z.string().url().or(z.literal("")).optional().default(""),
  youtube: z.string().url().or(z.literal("")).optional().default(""),
  twitter: z.string().url().or(z.literal("")).optional().default(""),
});
export type SocialLinks = z.infer<typeof socialLinksSchema>;

export type Settings = {
  businessName: string;
  tagline: string;
  heroPhrase: string;
  logoUrl: string;
  logoKey: string;
  whatsappNumber: string;
  address: string;
  schedule: WeekSchedule;
  social: SocialLinks;
  theme: ThemeId;
  aiEnabled: boolean;
  aiImagesUsedToday: number;
  aiUsageResetAt: string;
};

export const settingsUpdateSchema = z
  .object({
    businessName: z.string().min(2, "Pon un nombre."),
    tagline: z.string().max(160),
    heroPhrase: z.string().max(200),
    logoUrl: z.string(),
    logoKey: z.string(),
    whatsappNumber: z.string(),
    address: z.string(),
    schedule: weekScheduleSchema,
    social: socialLinksSchema,
    theme: z.enum(THEME_IDS as [ThemeId, ...ThemeId[]]),
    aiEnabled: z.boolean(),
    aiImagesUsedToday: z.number().int().nonnegative(),
    aiUsageResetAt: z.string(),
  })
  .partial();

export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;

export const DEFAULT_SCHEDULE: WeekSchedule = {
  mon: { closed: false, open: "09:00", close: "18:00" },
  tue: { closed: false, open: "09:00", close: "18:00" },
  wed: { closed: false, open: "09:00", close: "18:00" },
  thu: { closed: false, open: "09:00", close: "18:00" },
  fri: { closed: false, open: "09:00", close: "18:00" },
  sat: { closed: false, open: "10:00", close: "14:00" },
  sun: { closed: true, open: "00:00", close: "00:00" },
};

export const EMPTY_SOCIAL: SocialLinks = {
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  twitter: "",
};

export const FALLBACK_SETTINGS: Settings = {
  businessName: "Mi negocio",
  tagline: "",
  heroPhrase: "",
  logoUrl: "",
  logoKey: "",
  whatsappNumber: "",
  address: "",
  schedule: DEFAULT_SCHEDULE,
  social: EMPTY_SOCIAL,
  theme: "default",
  aiEnabled: false,
  aiImagesUsedToday: 0,
  aiUsageResetAt: "",
};

/**
 * Agrupa días consecutivos con el mismo horario.
 *
 * Ejemplo: si lun-vie es 9-18 y sáb-dom cerrado, devuelve
 *   [{ days: [mon,tue,wed,thu,fri], hours }, { days: [sat,sun], hours: closed }]
 */
export function groupSchedule(
  schedule: WeekSchedule,
): Array<{ days: DayKey[]; hours: DayHours }> {
  const groups: Array<{ days: DayKey[]; hours: DayHours }> = [];
  for (const key of DAY_KEYS) {
    const day = schedule[key];
    const last = groups[groups.length - 1];
    if (
      last &&
      last.hours.closed === day.closed &&
      last.hours.open === day.open &&
      last.hours.close === day.close
    ) {
      last.days.push(key);
    } else {
      groups.push({ days: [key], hours: day });
    }
  }
  return groups;
}

export function formatDayRange(days: DayKey[]): string {
  if (days.length === 1) return DAY_SHORT[days[0]];
  return `${DAY_SHORT[days[0]]} – ${DAY_SHORT[days[days.length - 1]]}`;
}

export function formatHours(h: DayHours): string {
  if (h.closed) return "Cerrado";
  return `${h.open} – ${h.close}`;
}

const SCHEMA_ORG_DAY: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export type OpeningHoursSpec = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
};

/**
 * Convierte el WeekSchedule al formato Schema.org OpeningHoursSpecification,
 * agrupando días con el mismo horario y omitiendo los días cerrados.
 */
export function toOpeningHoursSpec(
  schedule: WeekSchedule,
): OpeningHoursSpec[] {
  return groupSchedule(schedule)
    .filter((g) => !g.hours.closed)
    .map((g) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: g.days.map((d) => SCHEMA_ORG_DAY[d]),
      opens: g.hours.open,
      closes: g.hours.close,
    }));
}
