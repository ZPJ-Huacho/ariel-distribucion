"use client";

import { useQuery } from "@tanstack/react-query";
import type { AppError } from "@/shared/infrastructure/http";
import type { Order } from "@/core/orders";
import { profileKeys } from "./keys";
import { fetchMyOrders } from "./orders.api";

export function useMyOrders() {
  return useQuery<Order[], AppError>({
    queryKey: profileKeys.myOrders(),
    queryFn: fetchMyOrders,
  });
}
