import bcrypt from "bcryptjs";
import type { UserRepository } from "../domain/repositories";
import type { User, RegisterInput, UpdateProfileInput } from "../domain/models";
import type { Session } from "@/core/shared";
import {
  ConflictError,
  UnauthorizedError,
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
