"use client";

import { useMutation } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { CreateOrderInput, Order } from "@/core/orders";
import { createOrder } from "./orders.api";

type Input = CreateOrderInput & { _ts?: string | null; _hp?: string };

export function useCreateOrder() {
  return useMutation<Order, AppError, Input>({
    mutationFn: createOrder,
  });
}
