import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email no válido."),
  password: z.string().min(4, "Mínimo 4 caracteres."),
});
export type LoginPayload = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Pon tu nombre."),
  email: z.string().email("Email no válido."),
  password: z.string().min(4, "Mínimo 4 caracteres."),
  phone: z
    .string()
    .min(9, "Teléfono no válido.")
    .regex(/^[0-9 +\-]+$/, "Solo números."),
});
export type RegisterPayload = z.infer<typeof registerSchema>;

export const categoryInputSchema = z.object({
  slug: z
    .string()
    .min(2, "Pon un slug.")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones."),
  title: z.string().min(2, "Pon un título."),
  lead: z.string().max(160).default(""),
  icon: z.string().min(1, "Pon un icono o emoji."),
  sortOrder: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
});
export type CategoryInputPayload = z.infer<typeof categoryInputSchema>;

export const productInputSchema = z.object({
  name: z.string().min(2, "Pon un nombre."),
  description: z.string().max(240).default(""),
  price: z.number().positive("El precio debe ser mayor que 0."),
  unit: z.string().min(2, "Indica la unidad."),
  category: z.string().min(1, "Elige una categoría."),
  emoji: z.string().min(1).default("📦"),
  gradient: z.string().default(""),
  isAvailable: z.boolean().default(true),
  isHighlighted: z.boolean().default(false),
  imageR2Key: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});
export type ProductInputPayload = z.infer<typeof productInputSchema>;

export const orderItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
  price: z.number().nonnegative(),
});

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
export type CreateOrderPayload = z.infer<typeof createOrderSchema>;

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;
