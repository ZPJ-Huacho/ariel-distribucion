import type { AppError } from "@/shared/infrastructure/http";

const CODE_LABEL: Record<string, string> = {
  email_in_use: "Ese email ya está registrado.",
  slug_in_use: "Ese slug ya existe.",
  category_in_use: "La categoría tiene productos, primero muévelos.",
  file_too_large: "El archivo pesa demasiado (máx. 2 MB).",
  invalid_type: "Formato de archivo no permitido (usa JPG, PNG o WebP).",
  invalid_current_password: "La contraseña actual no es correcta.",
  invalid_category: "La categoría seleccionada ya no existe.",
};

/**
 * Convierte un AppError (o error genérico) en un mensaje humano listo para
 * mostrar en un toast o alert.
 */
export function toUiMessage(err: unknown, fallback = "Ocurrió un error."): string {
  const e = err as Partial<AppError> | undefined;
  if (!e || typeof e !== "object") return fallback;

  if (e.code && CODE_LABEL[e.code]) return CODE_LABEL[e.code];

  switch (e.kind) {
    case "auth":
      return "Tu sesión no es válida o la contraseña es incorrecta.";
    case "forbidden":
      return "No tienes permisos para hacer esto.";
    case "not_found":
      return "No encontramos lo que pediste.";
    case "conflict":
      return e.message || "Hay un conflicto con los datos enviados.";
    case "validation":
      return e.message ? `Revisa los datos: ${e.message}` : "Revisa los datos del formulario.";
    case "network":
      return "Sin conexión con el servidor. Comprueba tu internet.";
    case "server":
      return "Error del servidor. Intenta de nuevo en unos segundos.";
    case "unknown":
    default:
      return e.message || fallback;
  }
}
