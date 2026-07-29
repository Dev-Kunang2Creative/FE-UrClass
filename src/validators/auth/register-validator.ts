import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Nama wajib diisi" }).trim(),
    email: z
      .string()
      .min(1, { message: "Email wajib diisi" })
      .email({ message: "Format email tidak valid" })
      .trim(),
    password: z
      .string()
      .min(6, { message: "Password minimal 6 karakter" }),
    password_confirmation: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

export type RegisterType = z.infer<typeof registerSchema>;
