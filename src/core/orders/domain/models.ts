import { z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
  price: z.number().nonnegative(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const createOrderSchema = z.object({
  customerName: z.string().min(2, "Pon tu nombre, por favor."),
  customerPhone: z
    .string()
    .min(9, "Pon un teléfono válido.")
    .regex(/^[0-9 +\-]+$/, "Solo números."),
  customerAddress: z.string().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Necesitas al menos un producto."),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type Order = {
  id: string;
  userId: string | null;
  code: string;
  status: OrderStatus;
  source: string;
  total: number;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  preferredTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
