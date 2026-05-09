"use client";

import { useEffect, useRef } from "react";
import {
  CUSTOMER_STORAGE_KEY,
  ORDERS_STORAGE_KEY,
  useOrders,
} from "@/lib/orders-store";
import type { CustomerProfile, DemoOrder } from "@/lib/data/types";

export function StorageSync() {
  const orders = useOrders((s) => s.orders);
  const customer = useOrders((s) => s.customer);
  const hydrated = useOrders((s) => s.hydrated);
  const setHydrated = useOrders((s) => s.setHydrated);
  const initialMount = useRef(true);

  useEffect(() => {
    let storedOrders: DemoOrder[] = [];
    let storedCustomer: CustomerProfile | null = null;
    try {
      const o = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (o) storedOrders = JSON.parse(o) as DemoOrder[];
    } catch {}
    try {
      const c = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (c) storedCustomer = JSON.parse(c) as CustomerProfile;
    } catch {}
    setHydrated(storedOrders, storedCustomer);
  }, [setHydrated]);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (!hydrated) return;
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {}
  }, [orders, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (customer) {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      }
    } catch {}
  }, [customer, hydrated]);

  return null;
}
