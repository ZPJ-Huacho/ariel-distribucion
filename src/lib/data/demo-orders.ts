import type { DemoOrder } from "./types";

export const demoOrders: DemoOrder[] = [
  {
    id: "PED-2412",
    customerName: "Marta García",
    customerPhone: "+34 612 33 44 55",
    items: [
      { name: "Naranjas de mesa", quantity: 1, unit: "caja 10 kg", price: 18 },
      { name: "Aguacates Hass", quantity: 1, unit: "caja 4 kg", price: 24 },
    ],
    total: 42,
    status: "pending",
    source: "tiktok",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    notes: "Por favor entregar antes de las 12.",
  },
  {
    id: "PED-2411",
    customerName: "Jordi Puig",
    customerPhone: "+34 633 22 11 88",
    items: [
      { name: "Manzanas Fuji", quantity: 2, unit: "caja 8 kg", price: 18 },
      { name: "Plátanos de Canarias", quantity: 1, unit: "caja 4 kg", price: 14 },
    ],
    total: 50,
    status: "confirmed",
    source: "tiktok",
    createdAt: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
  },
  {
    id: "PED-2410",
    customerName: "Sofía Rodríguez",
    customerPhone: "+34 644 99 88 77",
    items: [
      { name: "Tomate Raf", quantity: 1, unit: "caja 3 kg", price: 18 },
      { name: "Lechuga romana", quantity: 1, unit: "6 unidades", price: 8 },
      { name: "Aguacates Hass", quantity: 1, unit: "caja 4 kg", price: 24 },
    ],
    total: 50,
    status: "preparing",
    source: "instagram",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "PED-2409",
    customerName: "Ricard Bosch",
    customerPhone: "+34 655 11 22 33",
    items: [
      { name: "Patatas Agria", quantity: 1, unit: "saco 10 kg", price: 12 },
      { name: "Cebolla dulce", quantity: 1, unit: "saco 5 kg", price: 8 },
      { name: "Ajos morados", quantity: 2, unit: "1 kg", price: 6 },
    ],
    total: 32,
    status: "delivered",
    source: "whatsapp",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "PED-2408",
    customerName: "Núria Vila",
    customerPhone: "+34 666 44 55 66",
    items: [
      { name: "Naranjas de zumo", quantity: 1, unit: "caja 15 kg", price: 22 },
      { name: "Limones", quantity: 1, unit: "caja 5 kg", price: 12 },
    ],
    total: 34,
    status: "delivered",
    source: "tiktok",
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
];
