import { NextResponse } from "next/server";
import {
  RegisterUserUseCase,
  getUserRepository,
  registerSchema,
} from "@/core/users";
import { jsonError } from "@/shared/lib/api-response";
import { checkRateLimit, getClientIp } from "@/shared/lib/rate-limit";
import { verifyTurnstile } from "@/shared/lib/turnstile";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", message: "Demasiados intentos. Espera un momento." },
        { status: 429, headers: { "retry-after": String(rl.retryAfterSec) } },
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Honeypot — silent success para que el bot no reintente.
    if (typeof body._hp === "string" && body._hp.length > 0) {
      return NextResponse.json({ user: null });
    }

    const turnstile = await verifyTurnstile(
      typeof body._ts === "string" ? body._ts : null,
      ip,
    );
    if (!turnstile.ok) {
      return NextResponse.json(
        { error: "captcha_failed", message: "Verificación de seguridad fallida." },
        { status: 400 },
      );
    }

    const input = registerSchema.parse(body);
    const useCase = new RegisterUserUseCase(getUserRepository());
    return NextResponse.json({ user: await useCase.execute(input) });
  } catch (err) {
    return jsonError(err);
  }
}
