import { NextResponse } from "next/server";
import {
  CreateOrderUseCase,
  ListOrdersUseCase,
  createOrderSchema,
  getOrderRepository,
} from "@/core/orders";
import { getSession } from "@/core/auth";
import { jsonError } from "@/shared/lib/api-response";
import { checkRateLimit, getClientIp } from "@/shared/lib/rate-limit";
import { verifyTurnstile } from "@/shared/lib/turnstile";

export async function GET() {
  try {
    const session = await getSession();
    const useCase = new ListOrdersUseCase(getOrderRepository());
    return NextResponse.json(await useCase.execute(session));
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`orders:${ip}`, 8, 60 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", message: "Demasiados pedidos seguidos. Espera un momento." },
        { status: 429, headers: { "retry-after": String(rl.retryAfterSec) } },
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    if (typeof body._hp === "string" && body._hp.length > 0) {
      return NextResponse.json({ ok: true });
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

    const input = createOrderSchema.parse(body);
    const session = await getSession();
    const useCase = new CreateOrderUseCase(getOrderRepository());
    return NextResponse.json(await useCase.execute(session, input));
  } catch (err) {
    return jsonError(err);
  }
}
