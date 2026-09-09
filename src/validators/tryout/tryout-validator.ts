import z from "zod";

export const tryoutSchema = z.object({
  title: z
    .string()
    .min(1, "Judul tryout wajib diisi")
    .max(150, "Judul tryout maksimal 150 karakter"),

  description: z
    .string()
    .min(1, "Deskripsi tryout wajib diisi")
    .max(500, "Deskripsi maksimal 500 karakter"),

  is_published: z.boolean(),
  is_free: z.boolean(),
  use_irt: z.boolean(),
  randomize_options: z.boolean(),

  start_date: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), {
      message: "start_date harus format tanggal yang valid (ISO string).",
    }),

  end_date: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), {
      message: "end_date harus format tanggal yang valid (ISO string).",
    }),

  image: z.instanceof(File).optional().nullable(),

  /**
   * Cermin dari `kategori`, bukan pilihan tersendiri. UrClass hanya punya dua
   * kategori - UTBK dan CPNS - jadi server yang menurunkannya dari jalur yang
   * dipilih; sub-kategori lama (UM, SNBP, SKD, SKB, Kedinasan) sudah tidak ada.
   */
  category: z
    .enum(["UTBK", "CPNS"], { message: "Kategori tidak valid" })
    .optional()
    .nullable(),

  // Exam track. Decides which dashboard the tryout shows up on.
  kategori: z.enum(["utbk", "cpns"], {
    message: "Jalur harus UTBK atau CPNS",
  }),
});

export type TryoutType = z.infer<typeof tryoutSchema>;
