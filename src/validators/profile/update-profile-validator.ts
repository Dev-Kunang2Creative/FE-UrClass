import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Nama lengkap harus diisi"),
  phone_number: z.string().min(10, "Nomor HP tidak valid"),
  grade_level: z.string().min(1, "Jenjang harus dipilih"),
  class_level: z.string().optional(),
  school_origin: z.string().min(1, "Asal sekolah harus diisi"),
  gender: z.string().optional(), // "L" | "P"
  birth_date: z.string().optional(), // YYYY-MM-DD
  province: z.string().optional(),
  city: z.string().optional(),
  target_university_1: z.string().optional(),
  target_major_1: z.string().optional(),
});

export type UpdateProfileType = z.infer<typeof updateProfileSchema>;
