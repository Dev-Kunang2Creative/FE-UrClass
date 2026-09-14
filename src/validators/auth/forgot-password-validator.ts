import { z } from "zod";

/**
 * Langkah 1: membuktikan diri lewat data profil.
 *
 * Tanpa SMTP tidak ada kanal luar yang bisa dipakai mengirim tautan, jadi
 * pembuktiannya memakai dua data yang wajib diisi peserta di profilnya.
 * Servernya yang memutuskan cocok atau tidak; skema ini hanya menjaga bentuk
 * masukannya supaya kesalahan ketik tertangkap sebelum menghabiskan jatah
 * percobaan yang jumlahnya terbatas.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email wajib diisi" })
    .email({ message: "Format email tidak valid" })
    .trim(),
  birth_date: z
    .string()
    .min(1, { message: "Tanggal lahir wajib diisi" })
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "Tanggal lahir tidak valid",
    }),
  // Dibiarkan longgar dengan sengaja: server menormalkan "+62", "0", spasi,
  // dan tanda hubung sebelum membandingkan, jadi menolak format di sini hanya
  // akan menggagalkan pemilik akun yang sah karena cara menulisnya berbeda.
  phone_number: z
    .string()
    .min(6, { message: "Nomor HP wajib diisi" })
    .trim(),
});

/** Langkah 2: menukar token dengan password baru. */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    password_confirmation: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
