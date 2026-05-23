"use client";

import { useEffect, useRef } from "react";
import {
  CUSTOMER_STORAGE_KEY,
  ORDERS_STORAGE_KEY,
  useOrders,
} from "@/lib/orders-store";
import { PRODUCTS_STORAGE_KEY, useProducts } from "@/lib/products-store";
import {
  CATEGORIES_STORAGE_KEY,
  useCategories,
} from "@/lib/categories-store";
import type {
  CategoryDef,
  CustomerProfile,
  DemoOrder,
  Product,
} from "@mercabana/core";

export function StorageSync() {
  const orders = useOrders((s) => s.orders);
  const customer = useOrders((s) => s.customer);
  const hydrated = useOrders((s) => s.hydrated);
  const setHydrated = useOrders((s) => s.setHydrated);

  const productsHydrated = useProducts((s) => s.hydrated);
  const setProductsHydrated = useProducts((s) => s.setHydrated);
  const products = useProducts((s) => s.products);

  const categoriesHydrated = useCategories((s) => s.hydrated);
  const setCategoriesHydrated = useCategories((s) => s.setHydrated);
  const categories = useCategories((s) => s.categories);

  const initialOrders = useRef(true);
  const initialProducts = useRef(true);
  const initialCategories = useRef(true);

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
    let storedProducts: Product[] | null = null;
    try {
      const p = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (p) storedProducts = JSON.parse(p) as Product[];
    } catch {}
    setProductsHydrated(storedProducts);
  }, [setProductsHydrated]);

  useEffect(() => {
    let storedCategories: CategoryDef[] | null = null;
    try {
      const c = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (c) storedCategories = JSON.parse(c) as CategoryDef[];
    } catch {}
    setCategoriesHydrated(storedCategories);
  }, [setCategoriesHydrated]);

  useEffect(() => {
    if (initialOrders.current) {
      initialOrders.current = false;
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

  useEffect(() => {
    if (initialProducts.current) {
      initialProducts.current = false;
      return;
    }
    if (!productsHydrated) return;
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        console.warn("localStorage lleno: no se han podido guardar todos los productos");
      }
    }
  }, [products, productsHydrated]);

  useEffect(() => {
    if (initialCategories.current) {
      initialCategories.current = false;
      return;
    }
    if (!categoriesHydrated) return;
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch {}
  }, [categories, categoriesHydrated]);

  return null;
}
