import { z } from "zod";
import { NAMA_MAKS, NAMA_PESAN, NAMA_REGEX } from "@/lib/input-rules";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Nama wajib diisi" })
      .max(NAMA_MAKS, { message: `Nama maksimal ${NAMA_MAKS} karakter` })
      .regex(NAMA_REGEX, { message: NAMA_PESAN }),
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
    cf_turnstile_response: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

export type RegisterType = z.infer<typeof registerSchema>;
