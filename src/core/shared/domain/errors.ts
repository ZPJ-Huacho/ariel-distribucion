export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "DomainError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super("unauthorized", "No autorizado");
  }
}

export class ForbiddenError extends DomainError {
  constructor() {
    super("forbidden", "Sin permisos");
  }
}

export class NotFoundError extends DomainError {
  constructor(entity = "entidad") {
    super("not_found", `${entity} no encontrada`);
  }
}

export class ConflictError extends DomainError {
  constructor(code: string, message?: string) {
    super(code, message);
  }
}

export class ValidationError extends DomainError {
  constructor(
    public readonly details: unknown,
    message = "Datos inválidos",
  ) {
    super("bad_request", message);
  }
}
