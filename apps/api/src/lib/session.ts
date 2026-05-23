import { nanoid } from "nanoid";

export const SESSION_COOKIE = "mb_sid";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionData = {
  userId: string;
  tenantId: string;
  expiresAt: number;
};

export function generateSessionToken(): string {
  return nanoid(32);
}

export async function createSession(
  kv: KVNamespace,
  data: { userId: string; tenantId: string },
): Promise<{ token: string; expiresAt: number }> {
  const token = generateSessionToken();
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload: SessionData = { ...data, expiresAt };
  await kv.put(sessionKey(token), JSON.stringify(payload), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
  return { token, expiresAt };
}

export async function readSession(
  kv: KVNamespace,
  token: string | undefined,
): Promise<SessionData | null> {
  if (!token) return null;
  const raw = await kv.get(sessionKey(token));
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SessionData;
    if (data.expiresAt < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function deleteSession(kv: KVNamespace, token: string): Promise<void> {
  await kv.delete(sessionKey(token));
}

function sessionKey(token: string): string {
  return `session:${token}`;
}

export function sessionCookieAttributes(maxAgeSeconds = SESSION_TTL_SECONDS): string {
  return `Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAgeSeconds}`;
}
