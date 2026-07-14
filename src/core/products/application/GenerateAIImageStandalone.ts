import { env } from "@/shared/lib/env";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  type Session,
} from "@/core/shared";
import type { SettingsRepository } from "@/core/settings/domain/repositories";
import type { StorageRepository } from "@/core/storage";
import { generateProductImage } from "../infrastructure/GeminiImageGenerator";

/**
 * Genera una imagen con IA a partir del NOMBRE del producto, sin acoplarla
 * a un producto existente. Uso: cuando el admin crea un producto nuevo y
 * quiere ver la imagen antes de guardar. La imagen queda subida a R2; su
 * `key` se envía luego en el payload de creación del producto.
 *
 * Descuenta cuota igual que la versión asociada a producto — el coste real
 * a Gemini ya se ha incurrido.
 */
export class GenerateAIImageStandaloneUseCase {
  constructor(
    private readonly settingsRepo: SettingsRepository,
    private readonly storage: StorageRepository,
  ) {}

  async execute(
    actor: Session,
    productName: string,
  ): Promise<{ url: string; key: string; used: number; limit: number }> {
    if (!actor?.user) throw new UnauthorizedError();
    if (actor.user.role !== "admin") throw new ForbiddenError();

    const trimmed = productName.trim();
    if (!trimmed) throw new ConflictError("empty_product_name");

    const settings = await this.settingsRepo.get();
    if (!settings) throw new NotFoundError("settings");
    if (!settings.aiEnabled) throw new ConflictError("ai_disabled");

    const today = todayKey();
    const isNewDay = settings.aiUsageResetAt !== today;
    const currentUsed = isNewDay ? 0 : settings.aiImagesUsedToday;
    const limit = env.AI_DAILY_LIMIT;

    if (currentUsed >= limit) throw new ConflictError("ai_daily_limit_reached");

    const generated = await generateProductImage({
      productName: trimmed,
      businessName: settings.businessName,
    });

    const buffer = Buffer.from(generated.base64, "base64");
    const file = new File([buffer as BlobPart], `${Date.now()}.png`, {
      type: generated.mimeType,
    });

    const upload = await this.storage.uploadImage(file, "products");
    if (!upload.ok) {
      if (upload.error === "file_too_large")
        throw new ConflictError("file_too_large");
      throw new ConflictError(upload.error);
    }

    const nextUsed = currentUsed + 1;
    await this.settingsRepo.update({
      aiImagesUsedToday: nextUsed,
      aiUsageResetAt: today,
    });

    return {
      url: upload.url,
      key: upload.key,
      used: nextUsed,
      limit,
    };
  }
}

function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
