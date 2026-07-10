import { z } from "zod";

export type Category = {
  id: string;
  slug: string;
  title: string;
  lead: string;
  icon: string;
  sortOrder: number;
  active: boolean;
};

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

export type CategoryInput = z.infer<typeof categoryInputSchema>;
