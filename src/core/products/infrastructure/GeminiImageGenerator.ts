import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/shared/lib/env";
import { ConflictError, ValidationError } from "@/core/shared";

// Modelo de generación de imágenes de Google (familia "Nano Banana").
// Configurable vía env para poder cambiar sin recompilar cuando salgan versiones nuevas.
// Alternativas: gemini-2.5-flash-image (Nano Banana estable), gemini-3-pro-image (Pro),
// gemini-3.1-flash-lite-image (Lite, más barato).
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
// Cadena de fallback: si un modelo devuelve 429, se prueba el siguiente.
// Puedes forzar uno concreto con la env var GEMINI_TEXT_MODEL.
const TEXT_MODELS: string[] = process.env.GEMINI_TEXT_MODEL
  ? [process.env.GEMINI_TEXT_MODEL]
  : [
      "gemini-2.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-2.0-flash-lite-001",
      "gemini-2.0-flash",
      "gemini-2.5-flash",
    ];
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const textEndpoint = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const PROMPT_TEMPLATE = `A highly detailed, professional product photograph of {PRODUCT}, packed densely in a rustic, aged wooden crate, identical in construction, color, texture and proportions to the crate seen in the reference image. The crate features distinct, realistic branding printed directly onto the front-facing plank, which reads '{BUSINESS}' in a clean, professional, dark teal-blue font (approximately #0C3B3B), exactly like the branding style in the reference image. The crate is positioned centrally on the same rough, weathered wooden table surface, against the same warm, softly blurred, and out-of-focus rustic cellar background from the reference image. The lighting is soft and directional, highlighting the natural textures of {PRODUCT} and the wood grain. The perspective is a 3/4 view. Shallow depth of field focuses sharply on the crate and the front rows of the produce. No text, watermarks, or logos other than '{BUSINESS}' on the crate. Photorealistic, ultra sharp, high resolution.`;

async function loadReferenceImage(): Promise<{
  data: string;
  mimeType: string;
}> {
  const referencePath = path.join(
    process.cwd(),
    "public",
    "theme",
    "ai-reference.png",
  );
  const buffer = await fs.readFile(referencePath);
  return {
    data: buffer.toString("base64"),
    mimeType: "image/png",
  };
}

export type GeneratedImage = {
  base64: string;
  mimeType: string;
};

/**
 * Genera una imagen fotorealista del producto en la caja branded del negocio
 * usando Gemini 2.5 Flash Image con la foto de referencia + prompt curado.
 */
export async function generateProductImage({
  productName,
  businessName,
}: {
  productName: string;
  businessName: string;
}): Promise<GeneratedImage> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ConflictError("gemini_api_key_missing");
  }

  const reference = await loadReferenceImage();
  const prompt = PROMPT_TEMPLATE.replaceAll("{PRODUCT}", productName).replaceAll(
    "{BUSINESS}",
    businessName || "MERCADIGITAL",
  );

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: reference.mimeType,
              data: reference.data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    // Log completo al servidor para debug
    console.error("[Gemini error]", res.status, errText);

    if (res.status === 429) {
      // Extraer detalle del mensaje de Google si posible
      let detail = "rate_limited";
      try {
        const j = JSON.parse(errText) as {
          error?: { message?: string; status?: string };
        };
        detail = j.error?.message?.slice(0, 200) || j.error?.status || detail;
      } catch {
        // ignore
      }
      throw new ConflictError(`gemini_rate_limited: ${detail}`);
    }
    if (res.status === 403 || res.status === 401) {
      throw new ConflictError(`gemini_auth_error: ${errText.slice(0, 200)}`);
    }
    if (res.status === 404) {
      throw new ConflictError(`gemini_model_not_found: modelo '${MODEL}' no existe o no está disponible para tu key`);
    }
    throw new ValidationError({
      gemini: `status_${res.status}: ${errText.slice(0, 200)}`,
    });
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ inlineData?: { data: string; mimeType: string } }>;
      };
    }>;
  };

  const part = json.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData,
  );
  if (!part?.inlineData?.data) {
    throw new ValidationError({ gemini: "no_image_in_response" });
  }

  return {
    base64: part.inlineData.data,
    mimeType: part.inlineData.mimeType ?? "image/png",
  };
}

const DESC_PROMPT_TEMPLATE = `Escribe una descripción corta y comercial en español para el producto "{PRODUCT}" que vende "{BUSINESS}" (distribución mayorista de fruta y verdura fresca desde Mercabarna).

Requisitos estrictos:
- Máximo 160 caracteres, ideal 100-140.
- 1 o 2 frases, directas y apetecibles.
- Menciona brevemente calidad, frescura, origen o características típicas del producto.
- No uses emojis.
- No uses comillas, ni prefijos tipo "Descripción:", ni saltos de línea.
- Solo devuelve el texto plano de la descripción, nada más.`;

type GeminiTextBody = {
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    candidateCount: number;
  };
  safetySettings: Array<{ category: string; threshold: string }>;
};

/** Llama a un modelo de texto concreto. Devuelve { text, retryable429 }. */
async function callTextModel(
  model: string,
  apiKey: string,
  body: GeminiTextBody,
): Promise<{ text: string; retryable429: boolean }> {
  const res = await fetch(`${textEndpoint(model)}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    const errText = await res.text().catch(() => "");
    console.warn(`[Gemini text 429] ${model} — probando siguiente`, errText.slice(0, 200));
    return { text: "", retryable429: true };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`[Gemini text error]`, model, res.status, errText);
    return { text: "", retryable429: false };
  }

  const rawJson = await res.json();
  const json = rawJson as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    promptFeedback?: unknown;
  };

  const candidate = json.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) {
    console.error(
      `[Gemini text empty]`,
      model,
      "finishReason:",
      candidate?.finishReason,
      "promptFeedback:",
      JSON.stringify(json.promptFeedback),
    );
    return { text: "", retryable429: false };
  }

  return { text, retryable429: false };
}

/**
 * Genera una descripción comercial corta del producto con Gemini Flash (texto).
 * Muy barato (~$0.0001 por llamada), rápido (< 1s).
 *
 * Itera por una cadena de modelos: si el primero devuelve 429 (quota agotada),
 * intenta el siguiente. Así el free tier de UN modelo agotado no bloquea toda
 * la feature.
 */
export async function generateProductDescription({
  productName,
  businessName,
}: {
  productName: string;
  businessName: string;
}): Promise<string> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) throw new ConflictError("gemini_api_key_missing");

  const prompt = DESC_PROMPT_TEMPLATE.replaceAll("{PRODUCT}", productName).replaceAll(
    "{BUSINESS}",
    businessName || "MERCADIGITAL",
  );

  const body: GeminiTextBody = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 400,
      candidateCount: 1,
    },
    // Desactivamos safety filters — el contenido es fruta/verdura, no hay riesgo real
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  for (const model of TEXT_MODELS) {
    const { text, retryable429 } = await callTextModel(model, apiKey, body);
    if (text) {
      // Éxito — limpiar y devolver
      const cleaned = text
        .replace(/^["'“”]|["'“”]$/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 240);
      return cleaned;
    }
    if (!retryable429) {
      // Error no recuperable (auth, respuesta vacía por safety, etc)
      return "";
    }
    // Era 429, seguimos con el siguiente modelo
  }

  console.error(
    "[Gemini text] TODOS los modelos devolvieron 429 — activar billing o esperar reset diario",
  );
  return "";
}
