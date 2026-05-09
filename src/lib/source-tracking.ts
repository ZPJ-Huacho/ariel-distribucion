"use client";

const SOURCE_KEY = "fdm-source";

const knownSources = ["tiktok", "instagram", "whatsapp", "google", "direct"] as const;

export function captureSource(): string {
  if (typeof window === "undefined") return "direct";
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    sessionStorage.setItem(SOURCE_KEY, ref);
    return ref;
  }
  const stored = sessionStorage.getItem(SOURCE_KEY);
  if (stored) return stored;

  const referrer = document.referrer.toLowerCase();
  const inferred = knownSources.find((s) => referrer.includes(s));
  const fallback = inferred ?? "direct";
  sessionStorage.setItem(SOURCE_KEY, fallback);
  return fallback;
}

export function getCurrentSource(): string {
  if (typeof window === "undefined") return "direct";
  return sessionStorage.getItem(SOURCE_KEY) ?? "direct";
}
