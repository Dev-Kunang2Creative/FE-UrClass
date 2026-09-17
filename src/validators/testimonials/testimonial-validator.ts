import { z } from "zod";

export const testimonialSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  role: z.string().min(1, "Status / info kelulusan wajib diisi (contoh: Lolos FK UI 2024)"),
  program: z.enum(["UTBK-SNBT", "CPNS"]),
  quote: z.string().min(5, "Isi ulasan minimal 5 karakter"),
  rating: z.number().min(1).max(5).default(5),
  color_theme: z.enum(["pink", "yellow", "mint", "blue", "lavender", "cream"]).default("pink"),
  avatar_bg: z.string().optional().nullable(),
  avatar: z.any().optional().nullable(),
  order_no: z.number().default(0),
  is_active: z.boolean().default(true),
});

export type TestimonialFormInput = z.input<typeof testimonialSchema>;
export type TestimonialFormOutput = z.output<typeof testimonialSchema>;
