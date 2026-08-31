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
 *
 * isAdmin melonggarkan semuanya kecuali nama. Admin tidak pernah mengikuti
 * tryout, jadi tidak ada sertifikat atau laporan nilai yang perlu memakai data
 * dirinya - meminta nomor HP dan asal sekolah kepada admin hanyalah pekerjaan
 * yang tidak dipakai siapa pun.
 */
export const cpnsTargetTypes = ["kedinasan", "umum"] as const;
export type CpnsTargetType = (typeof cpnsTargetTypes)[number];

/**
 * @param requireTarget target kampus wajib - jalur UTBK.
 * @param isAdmin melonggarkan semuanya kecuali nama.
 * @param cpnsTarget sub-jalur CPNS yang dipilih, atau null kalau bukan CPNS.
 *   Menentukan pasangan field mana yang wajib: sekolah kedinasan mengisi
 *   sekolah dan program studi, CPNS umum mengisi instansi dan formasi. Meminta
 *   keduanya berarti meminta salah satu diisi asal-asalan.
 */
export function makeUpdateProfileSchema(
  requireTarget: boolean,
  isAdmin = false,
  cpnsTarget: CpnsTargetType | null = null,
) {
  const target =
    requireTarget && !isAdmin
      ? z.string().min(1, "Target ini harus diisi")
      : z.string().optional();

  const requiredForStudent = (schema: z.ZodString, message: string) =>
    isAdmin ? z.string().optional() : schema.min(1, message);

  const requiredWhen = (condition: boolean, message: string) =>
    condition && !isAdmin
      ? z.string().min(1, message)
      : z.string().optional();

  const kedinasan = cpnsTarget === "kedinasan";
  const umum = cpnsTarget === "umum";

  return z
    .object({
      name: z.string().min(1, "Nama lengkap harus diisi"),
      phone_number: isAdmin
        ? z.string().optional()
        : z
            .string()
            .min(10, "Nomor HP minimal 10 angka")
            .regex(/^[0-9+\-\s]+$/, "Nomor HP hanya boleh angka, +, - dan spasi"),
      grade_level: requiredForStudent(z.string(), "Jenjang harus dipilih"),
      class_level: z.string().optional(),
      school_origin: requiredForStudent(z.string(), "Asal sekolah harus diisi"),
      gender: isAdmin
        ? z.enum(["L", "P"]).optional()
        : z.enum(["L", "P"], { message: "Jenis kelamin harus dipilih" }),
      birth_date: requiredForStudent(z.string(), "Tanggal lahir harus diisi"),
      province: z.string().optional(),
      city: z.string().optional(),
      // Kolom yang sama menampung target PTN dan sekolah kedinasan: keduanya
      // berbentuk sekolah plus program studi.
      target_university_1: kedinasan
        ? requiredWhen(true, "Sekolah kedinasan tujuan harus diisi")
        : target,
      target_major_1: kedinasan
        ? requiredWhen(true, "Program studi tujuan harus diisi")
        : target,
      target_university_2: z.string().optional(),
      target_major_2: z.string().optional(),

      cpns_target_type: z.enum(cpnsTargetTypes).optional().nullable(),
      target_instansi_1: requiredWhen(umum, "Instansi tujuan harus diisi"),
      target_formasi_1: requiredWhen(umum, "Formasi tujuan harus diisi"),
      target_instansi_2: z.string().optional(),
      target_formasi_2: z.string().optional(),
    })
    .refine(
      (data) => isAdmin || data.grade_level === "Gap Year" || !!data.class_level,
      { message: "Kelas harus dipilih", path: ["class_level"] },
    );
}

/** Default shape, used for typing. Targets required, as UTBK is the default track. */
export const updateProfileSchema = makeUpdateProfileSchema(true);

export type UpdateProfileType = z.infer<typeof updateProfileSchema>;
