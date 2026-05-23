import { create } from "zustand";
import type { CustomerProfile, DemoOrder } from "@mercabana/core";

type OrdersState = {
  orders: DemoOrder[];
  customer: CustomerProfile | null;
  hydrated: boolean;
  addOrder: (order: DemoOrder) => void;
  setStatus: (id: string, status: DemoOrder["status"]) => void;
  setCustomer: (customer: CustomerProfile) => void;
  setHydrated: (orders: DemoOrder[], customer: CustomerProfile | null) => void;
};

export const useOrders = create<OrdersState>((set) => ({
  orders: [],
  customer: null,
  hydrated: false,
  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),
  setStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
  setCustomer: (customer) => set({ customer }),
  setHydrated: (orders, customer) => set({ orders, customer, hydrated: true }),
}));

export const ORDERS_STORAGE_KEY = "fdm-orders";
export const CUSTOMER_STORAGE_KEY = "fdm-customer";
