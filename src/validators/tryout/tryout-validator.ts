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

  /**
   * Durasi seluruh ujian CPNS, dalam menit - satu angka, bukan penjumlahan
   * durasi tiap subtes. Peserta SKD mengerjakan semua soal dalam satu waktu
   * dan bebas berpindah bagian, jadi tidak ada waktu terpisah per subtes yang
   * perlu diisi.
   *
   * Kosong untuk UTBK, yang memang dikerjakan subtes per subtes dengan
   * waktunya masing-masing.
   */
  duration_minutes: z
    .number({ message: "Durasi harus berupa angka" })
    .int("Durasi harus bilangan bulat")
    .min(1, "Durasi minimal 1 menit")
    .max(600, "Durasi maksimal 600 menit")
    .nullable()
    .optional(),
}).superRefine((value, ctx) => {
  // Wajib hanya di jalur CPNS: di sanalah satu-satunya angka yang menentukan
  // batas waktu ujian, jadi membiarkannya kosong berarti tryout tanpa timer.
  if (value.kategori === "cpns" && value.duration_minutes == null) {
    ctx.addIssue({
      code: "custom",
      path: ["duration_minutes"],
      message: "Durasi tryout CPNS wajib diisi",
    });
  }
});

export type TryoutType = z.infer<typeof tryoutSchema>;
