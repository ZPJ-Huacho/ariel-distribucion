import type { OrderRepository } from "../domain/repositories";
import type { CreateOrderInput, Order, OrderStatus } from "../domain/models";
import type { Session } from "@/core/shared";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/core/shared";

function requireAdmin(actor: Session): void {
  if (!actor?.user) throw new UnauthorizedError();
  if (actor.user.role !== "admin") throw new ForbiddenError();
}

export class CreateOrderUseCase {
  constructor(private readonly repo: OrderRepository) {}
  execute(actor: Session, input: CreateOrderInput): Promise<Order> {
    return this.repo.create(input, actor?.user?.id ?? null);
  }
}

export class ListOrdersUseCase {
  constructor(private readonly repo: OrderRepository) {}
  execute(actor: Session): Promise<Order[]> {
    requireAdmin(actor);
    return this.repo.list();
  }
}

export class ListMyOrdersUseCase {
  constructor(private readonly repo: OrderRepository) {}
  async execute(actor: Session): Promise<Order[]> {
    if (!actor?.user) throw new UnauthorizedError();
    return this.repo.listByUser(actor.user.id);
  }
}

export class UpdateOrderStatusUseCase {
  constructor(private readonly repo: OrderRepository) {}
  async execute(
    actor: Session,
    id: string,
    status: OrderStatus,
  ): Promise<Order> {
    requireAdmin(actor);
    const updated = await this.repo.updateStatus(id, status);
    if (!updated) throw new NotFoundError("pedido");
    return updated;
  }
}
