import { z } from "zod";

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  preferredDeliveryTime: string | null;
  role: "admin" | "customer";
  createdAt: string;
};

export type UserWithPassword = User & { passwordHash: string };

export const registerSchema = z.object({
  name: z.string().min(2, "Pon tu nombre."),
  email: z.string().email("Email no válido."),
  password: z.string().min(4, "Mínimo 4 caracteres."),
  phone: z
    .string()
    .min(9, "Teléfono no válido.")
    .regex(/^[0-9 +\-]+$/, "Solo números."),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email no válido."),
  password: z.string().min(4, "Mínimo 4 caracteres."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Pon tu nombre.").optional(),
    phone: z
      .string()
      .min(9, "Teléfono no válido.")
      .regex(/^[0-9 +\-]+$/, "Solo números.")
      .optional(),
    address: z.string().max(240).optional(),
    preferredDeliveryTime: z.string().max(120).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(4, "Mínimo 4 caracteres.").optional(),
  })
  .refine((d) => !d.newPassword || !!d.currentPassword, {
    message: "Pon tu contraseña actual para cambiarla.",
    path: ["currentPassword"],
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
