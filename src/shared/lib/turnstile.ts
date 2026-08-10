// Cloudflare Turnstile — verificación server-side del token que devuelve
// el widget. Si TURNSTILE_SECRET_KEY no está configurada, se salta la
// verificación (útil en dev). En producción, con la key seteada, el token
// es obligatorio.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const turnstileEnabled = !!process.env.TURNSTILE_SECRET_KEY;

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (!token) return { ok: false, reason: "missing_token" };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (data.success) return { ok: true };
    return { ok: false, reason: data["error-codes"]?.join(",") ?? "invalid_token" };
  } catch (err) {
    console.error("[turnstile] verify failed:", err);
    return { ok: false, reason: "verify_failed" };
  }
}
