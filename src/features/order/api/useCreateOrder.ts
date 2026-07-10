"use client";

import { useMutation } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { CreateOrderInput, Order } from "@/core/orders";
import { createOrder } from "./orders.api";

export function useCreateOrder() {
  return useMutation<Order, AppError, CreateOrderInput>({
    mutationFn: createOrder,
  });
}
