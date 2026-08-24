import { z } from "zod";

/**
 * Mirrors what the backend actually enforces.
 *
 * These rules used to be looser than ProfileController::update - birth_date,
 * gender and the target campus were all optional here and required there. A
 * form left half-filled therefore passed client validation, got a 422, and the
 * old submit handler swallowed it and reported success. The user saw their new
 * values and the database kept the old ones.
 *
 * requireTarget follows the reader track: a CPNS candidate has no target
 * campus, so demanding one would leave them unable to save at all.
 */
export function makeUpdateProfileSchema(requireTarget: boolean) {
  const target = requireTarget
    ? z.string().min(1, "Target ini harus diisi")
    : z.string().optional();

  return z
    .object({
      name: z.string().min(1, "Nama lengkap harus diisi"),
      phone_number: z
        .string()
        .min(10, "Nomor HP minimal 10 angka")
        .regex(/^[0-9+\-\s]+$/, "Nomor HP hanya boleh angka, +, - dan spasi"),
      grade_level: z.string().min(1, "Jenjang harus dipilih"),
      class_level: z.string().optional(),
      school_origin: z.string().min(1, "Asal sekolah harus diisi"),
      gender: z.enum(["L", "P"], { message: "Jenis kelamin harus dipilih" }),
      birth_date: z.string().min(1, "Tanggal lahir harus diisi"),
      province: z.string().optional(),
      city: z.string().optional(),
      target_university_1: target,
      target_major_1: target,
      target_university_2: z.string().optional(),
      target_major_2: z.string().optional(),
    })
    .refine(
      (data) => data.grade_level === "Gap Year" || !!data.class_level,
      { message: "Kelas harus dipilih", path: ["class_level"] },
    );
}

/** Default shape, used for typing. Targets required, as UTBK is the default track. */
export const updateProfileSchema = makeUpdateProfileSchema(true);

export type UpdateProfileType = z.infer<typeof updateProfileSchema>;
