"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { Order, OrderStatus } from "@/core/orders";
import { orderKeys } from "./keys";
import { fetchOrders, updateOrderStatus } from "./orders.api";

export function useOrders() {
  return useQuery<Order[], AppError>({
    queryKey: orderKeys.list(),
    queryFn: fetchOrders,
    refetchInterval: 30_000,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation<Order, AppError, { id: string; status: OrderStatus }>({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
