// Rate limit en memoria por instancia. Sirve como primer filtro anti-abuso
// para un negocio pequeño; NO es un rate limit distribuido. Para producción
// seria (varias regiones / autoscaling), migrar a Cloudflare Rate Limiting
// Rules o Upstash Redis.

type Bucket = { count: number; expiresAt: number };

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 5000;

function sweep(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, b] of buckets) {
    if (b.expiresAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  sweep(now);
  const existing = buckets.get(key);
  if (!existing || existing.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function getClientIp(req: Request): string {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    "unknown"
  );
}
