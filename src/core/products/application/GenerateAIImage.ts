import { env } from "@/shared/lib/env";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  type Session,
} from "@/core/shared";
import type { SettingsRepository } from "@/core/settings/domain/repositories";
import type { ProductRepository } from "../domain/repositories";
import type { StorageRepository } from "@/core/storage";
import { generateProductImage } from "../infrastructure/GeminiImageGenerator";

/**
 * Genera una imagen del producto con IA y la deja subida a R2 asignada al producto.
 * Descuenta 1 de la cuota diaria del tenant al generar (aunque el cliente descarte).
 */
export class GenerateAIImageUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly settingsRepo: SettingsRepository,
    private readonly storage: StorageRepository,
  ) {}

  async execute(
    actor: Session,
    productId: string,
  ): Promise<{ url: string; key: string; used: number; limit: number }> {
    if (!actor?.user) throw new UnauthorizedError();
    if (actor.user.role !== "admin") throw new ForbiddenError();

    const settings = await this.settingsRepo.get();
    if (!settings) throw new NotFoundError("settings");
    if (!settings.aiEnabled)
      throw new ConflictError("ai_disabled");

    const today = todayKey();
    const isNewDay = settings.aiUsageResetAt !== today;
    const currentUsed = isNewDay ? 0 : settings.aiImagesUsedToday;
    const limit = env.AI_DAILY_LIMIT;

    if (currentUsed >= limit) throw new ConflictError("ai_daily_limit_reached");

    const product = await this.products.findById(productId);
    if (!product) throw new NotFoundError("product");

    const generated = await generateProductImage({
      productName: product.name,
      businessName: settings.businessName,
    });

    const buffer = Buffer.from(generated.base64, "base64");
    const file = new File([buffer as BlobPart], `${productId}.png`, {
      type: generated.mimeType,
    });

    const upload = await this.storage.uploadImage(file, "products");
    if (!upload.ok) {
      if (upload.error === "file_too_large")
        throw new ConflictError("file_too_large");
      throw new ConflictError(upload.error);
    }

    const previous = await this.products.setImageKey(productId, upload.key);
    if (previous === null) {
      await this.storage.delete(upload.key).catch(() => {});
      throw new NotFoundError("producto");
    }
    if (
      previous &&
      !previous.startsWith("http") &&
      !previous.startsWith("data:")
    ) {
      await this.storage.delete(previous).catch(() => {});
    }

    // Descontar cuota al generar
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
  // Reset a medianoche Europe/Madrid
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
