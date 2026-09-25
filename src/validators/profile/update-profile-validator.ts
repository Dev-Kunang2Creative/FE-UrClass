import { z } from "zod";
import {
  NAMA_MAKS,
  NAMA_PESAN,
  NAMA_REGEX,
  TEKS_PENDEK_REGEX,
  TELEPON_PESAN,
  TELEPON_REGEX,
} from "../../lib/input-rules.ts";
import { butuhJurusan, butuhKelas } from "../../lib/jenjang.ts";

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
 *   sekolah, CPNS umum mengisi instansi dan formasi. Meminta
 *   keduanya berarti meminta salah satu diisi asal-asalan.
 * @param formasiOpen rekap formasi periode ini sudah terbit. Selama belum,
 *   formasi tidak bisa diwajibkan - kalau diwajibkan, tidak ada pelamar CPNS
 *   umum yang bisa menyimpan profilnya sampai daftarnya diumumkan. Sengaja
 *   dibuat sejajar dengan ProfileController, yang melonggarkan aturan yang sama
 *   di server.
 */
export function makeUpdateProfileSchema(
  requireTarget: boolean,
  isAdmin = false,
  cpnsTarget: CpnsTargetType | null = null,
  formasiOpen = true,
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
      name: z
        .string()
        .min(1, "Nama lengkap harus diisi")
        .max(NAMA_MAKS, `Nama maksimal ${NAMA_MAKS} karakter`)
        .regex(NAMA_REGEX, NAMA_PESAN),
      // Nilainya sudah dalam bentuk baku "+62..." - kolomnya menormalkan apa
      // pun yang diketik sebelum sampai ke sini.
      phone_number: isAdmin
        ? z.string().optional()
        : z.string().min(1, "Nomor HP harus diisi").regex(TELEPON_REGEX, TELEPON_PESAN),
      grade_level: requiredForStudent(z.string(), "Jenjang harus dipilih"),
      class_level: z.string().optional(),
      /** Jurusan pendidikan terakhir; hanya dipakai jenjang pendidikan tinggi. */
      education_major: z
        .string()
        .regex(TEKS_PENDEK_REGEX, "Jurusan mengandung karakter yang tidak diperbolehkan")
        .optional()
        .or(z.literal("")),
      school_origin: requiredForStudent(
        z.string().regex(TEKS_PENDEK_REGEX, "Asal sekolah mengandung karakter yang tidak diperbolehkan"),
        "Asal sekolah harus diisi",
      ),
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
        ? z.string().nullish()
        : target,
      target_university_2: z.string().optional(),
      target_major_2: z.string().nullish(),

      cpns_target_type:
        cpnsTarget !== null && !isAdmin
          ? z.enum(cpnsTargetTypes, {
              message: "Pilih dulu tujuanmu: sekolah kedinasan atau CPNS umum.",
            })
          : z.enum(cpnsTargetTypes).optional().nullable(),
      target_instansi_1: requiredWhen(umum, "Instansi tujuan harus diisi"),
      target_formasi_1: requiredWhen(
        umum && formasiOpen,
        "Formasi tujuan harus diisi",
      ),
      target_instansi_2: z.string().optional(),
      target_formasi_2: z.string().optional(),
    })
    // Kelas hanya untuk siswa SMA aktif; jurusan hanya untuk jenjang pendidikan
    // tinggi. Keduanya diturunkan dari jenjang yang dipilih, bukan ditanyakan
    // terpisah - dan aturannya sama persis dengan yang dijalankan server.
    .refine(
      (data) => isAdmin || !butuhKelas(data.grade_level) || !!data.class_level,
      { message: "Kelas harus dipilih", path: ["class_level"] },
    )
    .refine(
      (data) => isAdmin || !butuhJurusan(data.grade_level) || !!data.education_major,
      { message: "Jurusan pendidikan terakhir harus diisi", path: ["education_major"] },
    );
}

/** Default shape, used for typing. Targets required, as UTBK is the default track. */
export const updateProfileSchema = makeUpdateProfileSchema(true);

export type UpdateProfileType = z.infer<typeof updateProfileSchema>;
