import bcrypt from "bcryptjs";
import type { UserRepository } from "../domain/repositories";
import type { User, RegisterInput, UpdateProfileInput } from "../domain/models";
import type { Role, Session } from "@/core/shared";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  isAdmin,
} from "@/core/shared";

export class RegisterUserUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(input: RegisterInput): Promise<User> {
    const email = input.email.toLowerCase();
    const existing = await this.repo.findByEmail(email);
    if (existing) throw new ConflictError("email_in_use", "Ese email ya está registrado.");
    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.repo.create({
      email,
      passwordHash,
      name: input.name,
      phone: input.phone,
    });
  }
}

export class VerifyCredentialsUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(email: string, password: string): Promise<User | null> {
    const found = await this.repo.findByEmail(email.toLowerCase());
    if (!found) return null;
    const ok = await bcrypt.compare(password, found.passwordHash);
    if (!ok) return null;
    return {
      id: found.id,
      email: found.email,
      name: found.name,
      phone: found.phone,
      address: found.address,
      preferredDeliveryTime: found.preferredDeliveryTime,
      role: found.role,
      createdAt: found.createdAt,
    };
  }
}

export class GetProfileUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(actor: Session): Promise<User | null> {
    if (!actor?.user) return null;
    return this.repo.findById(actor.user.id);
  }
}

export class UpdateProfileUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(actor: Session, input: UpdateProfileInput): Promise<User> {
    if (!actor?.user) throw new UnauthorizedError();

    const patch: {
      name?: string;
      phone?: string;
      address?: string;
      preferredDeliveryTime?: string;
      passwordHash?: string;
    } = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.phone !== undefined) patch.phone = input.phone;
    if (input.address !== undefined) patch.address = input.address;
    if (input.preferredDeliveryTime !== undefined)
      patch.preferredDeliveryTime = input.preferredDeliveryTime;

    if (input.newPassword) {
      const hash = await this.repo.getPasswordHash(actor.user.id);
      const ok = hash
        ? await bcrypt.compare(input.currentPassword ?? "", hash)
        : false;
      if (!ok) throw new UnauthorizedError();
      patch.passwordHash = await bcrypt.hash(input.newPassword, 10);
    }

    const updated = await this.repo.updateProfile(actor.user.id, patch);
    if (!updated) throw new UnauthorizedError();
    return updated;
  }
}

// Reglas de gestión de usuarios:
// - super_admin ve y edita cualquier rol (excepto el suyo).
// - admin ve customer y admin; puede promover customer→admin y degradar
//   admin→customer, pero no puede tocar cuentas super_admin ni crear una.
// - Nadie cambia su propio rol (evita auto-lockout).
function assertCanManageUsers(actor: Session): NonNullable<Session> {
  if (!actor?.user) throw new UnauthorizedError();
  if (!isAdmin(actor.user.role)) throw new ForbiddenError();
  return actor;
}

function canSeeUser(viewerRole: Role, targetRole: Role): boolean {
  if (viewerRole === "super_admin") return true;
  return targetRole !== "super_admin";
}

function canChangeRole(
  viewer: { id: string; role: Role },
  target: { id: string; role: Role },
  newRole: Role,
): { ok: true } | { ok: false; reason: string } {
  if (viewer.id === target.id)
    return { ok: false, reason: "No puedes cambiar tu propio rol." };
  if (viewer.role === "super_admin") return { ok: true };
  // A partir de aquí, viewer es "admin".
  if (target.role === "super_admin")
    return { ok: false, reason: "No puedes modificar a un super_admin." };
  if (newRole === "super_admin")
    return { ok: false, reason: "Solo un super_admin puede asignar ese rol." };
  return { ok: true };
}

export class ListUsersUseCase {
  constructor(private readonly repo: UserRepository) {}
  async execute(actor: Session): Promise<User[]> {
    const s = assertCanManageUsers(actor);
    const all = await this.repo.listAll();
    return all.filter((u) => canSeeUser(s.user.role, u.role));
  }
}

export class UpdateUserRoleUseCase {
  constructor(private readonly repo: UserRepository) {}
  async execute(actor: Session, targetId: string, newRole: Role): Promise<User> {
    const s = assertCanManageUsers(actor);
    const target = await this.repo.findById(targetId);
    if (!target) throw new NotFoundError("usuario");
    if (!canSeeUser(s.user.role, target.role)) throw new NotFoundError("usuario");

    const check = canChangeRole(
      { id: s.user.id, role: s.user.role },
      { id: target.id, role: target.role },
      newRole,
    );
    if (!check.ok) throw new ForbiddenError();

    if (target.role === newRole) return target;
    const updated = await this.repo.updateRole(targetId, newRole);
    if (!updated) throw new NotFoundError("usuario");
    return updated;
  }
}
