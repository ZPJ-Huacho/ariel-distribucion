import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  type Session,
} from "@/core/shared";
import type { SettingsRepository } from "@/core/settings/domain/repositories";
import type { ProductRepository } from "../domain/repositories";
import { generateProductDescription } from "../infrastructure/GeminiImageGenerator";

/**
 * Genera una descripción comercial corta del producto con Gemini Flash.
 *
 * A diferencia de la imagen, esto NO descuenta cuota:
 * - Coste real es ~$0.0001 por llamada (200x más barato que imagen)
 * - Regenerar descripciones es UX importante: el cliente puede iterar hasta
 *   encontrar la copy que le convenza, sin miedo a agotar créditos
 */
export class GenerateAIDescriptionUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly settingsRepo: SettingsRepository,
  ) {}

  async execute(
    actor: Session,
    productId: string,
  ): Promise<{ description: string }> {
    if (!actor?.user) throw new UnauthorizedError();
    if (actor.user.role !== "admin") throw new ForbiddenError();

    const settings = await this.settingsRepo.get();
    if (!settings) throw new NotFoundError("settings");
    if (!settings.aiEnabled) throw new ConflictError("ai_disabled");

    const product = await this.products.findById(productId);
    if (!product) throw new NotFoundError("product");

    const description = await generateProductDescription({
      productName: product.name,
      businessName: settings.businessName,
    });

    if (!description) throw new ConflictError("empty_description");

    await this.products
      .update(productId, { description })
      .catch(() => {
        // No bloqueamos si el update falla — el cliente puede copiar el texto
      });

    return { description };
  }
}
