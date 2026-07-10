import { eq } from "drizzle-orm";
import { getDb, settings as settingsTable } from "@/shared/lib/db";
import type { SettingsRepository } from "../domain/repositories";
import {
  DEFAULT_SCHEDULE,
  EMPTY_SOCIAL,
  type Settings,
  type SettingsUpdate,
  type SocialLinks,
  type WeekSchedule,
} from "../domain/models";
import { NotFoundError } from "@/core/shared";
import { getTheme } from "@/shared/lib/themes";

export class SettingsRepositoryDrizzle implements SettingsRepository {
  async get(): Promise<Settings | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.id, 1))
      .limit(1);
    if (!rows[0]) return null;
    return toDomain(rows[0]);
  }

  async update(patch: SettingsUpdate): Promise<Settings> {
    const db = getDb();
    await db
      .update(settingsTable)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(settingsTable.id, 1));
    const rows = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.id, 1))
      .limit(1);
    if (!rows[0]) throw new NotFoundError("settings");
    return toDomain(rows[0]);
  }
}

function toDomain(row: typeof settingsTable.$inferSelect): Settings {
  return {
    businessName: row.businessName,
    tagline: row.tagline,
    heroPhrase: row.heroPhrase ?? "",
    logoUrl: row.logoUrl ?? "",
    logoKey: row.logoKey ?? "",
    whatsappNumber: row.whatsappNumber,
    address: row.address,
    schedule: (row.schedule as WeekSchedule | null) ?? DEFAULT_SCHEDULE,
    social: (row.social as SocialLinks | null) ?? EMPTY_SOCIAL,
    theme: getTheme(row.theme).id,
    aiEnabled: row.aiEnabled ?? false,
    aiImagesUsedToday: row.aiImagesUsedToday ?? 0,
    aiUsageResetAt: row.aiUsageResetAt ?? "",
  };
}
