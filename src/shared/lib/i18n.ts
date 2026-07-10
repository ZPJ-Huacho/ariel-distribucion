import esCatalog from "./i18n.es.json";

export type Messages = typeof esCatalog;

type Path<T, P extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: Path<T[K], P extends "" ? K : `${P}.${K}`>;
    }[keyof T & string]
  : P;

export type MessageKey = Path<Messages>;

export function getCatalog(): Messages {
  return esCatalog as Messages;
}

export type TranslateFn = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string;

export function createTranslator(messages: Messages): TranslateFn {
  return (key, vars) => {
    const raw = lookup(messages, key);
    if (raw == null) return key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k: string) =>
      vars[k] != null ? String(vars[k]) : `{${k}}`,
    );
  };
}

function lookup(messages: Messages, key: string): string | null {
  const parts = key.split(".");
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return null;
    }
  }
  return typeof cur === "string" ? cur : null;
}

export { esCatalog };
