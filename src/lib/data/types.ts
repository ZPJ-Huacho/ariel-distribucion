export type Category = "frutas" | "verduras" | "tropical";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: Category;
  emoji: string;
  gradient: string;
  isAvailable: boolean;
  isHighlighted?: boolean;
  sortOrder: number;
};

export type Tenant = {
  slug: string;
  name: string;
  tagline: string;
  whatsappNumber: string;
  address: string;
  deliveryHours: string;
  primaryColor: string;
  primaryColorDark: string;
  emoji: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  unit: string;
  emoji: string;
  gradient: string;
  quantity: number;
};

export type OrderSource = "tiktok" | "instagram" | "whatsapp" | "direct" | "google" | string;

export type DemoOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; unit: string; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivered";
  source: OrderSource;
  createdAt: string;
  notes?: string;
};
