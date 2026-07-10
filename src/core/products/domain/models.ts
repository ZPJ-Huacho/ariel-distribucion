import { z } from "zod";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  emoji: string;
  gradient: string;
  isAvailable: boolean;
  isHighlighted: boolean;
  sortOrder: number;
  imageKey: string | null;
  imageUrl?: string;
};

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
  imageKey: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
