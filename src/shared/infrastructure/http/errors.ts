import { AxiosError, isAxiosError } from "axios";

export type AppErrorKind =
  | "network"
  | "validation"
  | "auth"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "server"
  | "unknown";

export type AppError = {
  kind: AppErrorKind;
  status?: number;
  message: string;
  code?: string;
  details?: unknown;
};

export function toAppError(error: unknown): AppError {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data as
      | { error?: string; details?: unknown; message?: string }
      | undefined;
    const message = body?.message ?? body?.error ?? error.message;
    const code = body?.error;
    if (!status) return { kind: "network", message };
    if (status === 400) return { kind: "validation", status, message, code, details: body?.details };
    if (status === 401) return { kind: "auth", status, message, code };
    if (status === 403) return { kind: "forbidden", status, message, code };
    if (status === 404) return { kind: "not_found", status, message, code };
    if (status === 409) return { kind: "conflict", status, message, code };
    if (status >= 500) return { kind: "server", status, message };
    return { kind: "unknown", status, message };
  }
  if (error instanceof Error) return { kind: "unknown", message: error.message };
  return { kind: "unknown", message: "Error desconocido" };
}

export function isAppError(err: unknown): err is AppError {
  return (
    typeof err === "object" &&
    err !== null &&
    "kind" in err &&
    typeof (err as { kind: unknown }).kind === "string"
  );
}
