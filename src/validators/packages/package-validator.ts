import { z } from "zod";

export const packageSchema = z
  .object({
    name: z.string().min(1, "Nama package wajib diisi"),

    slug: z
      .string()
      .min(1, "Slug wajib diisi")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug hanya boleh huruf kecil, angka, dan tanda strip",
      ),

    description: z.string().optional().nullable(),

    thumbnail: z
      .custom<File>((v) => v instanceof File || v == null || v === undefined)
      .optional()
      .nullable()
      .refine(
        (file) =>
          !file ||
          ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
            file.type,
          ),
        { message: "Format gambar harus jpg, jpeg, png, atau webp" },
      )
      .refine((file) => !file || file.size <= 2 * 1024 * 1024, {
        message: "Ukuran gambar maksimal 2MB",
      }),

    price: z.number().min(0, "Harga tidak boleh negatif").default(10000),

    discount_price: z.number().min(0).nullable().optional(),

    ticket_amount: z.number().min(1, "Jumlah tiket minimal 1").default(1),

    currency: z
      .string()
      .min(1, "Mata uang wajib diisi")
      .max(10, "Mata uang maksimal 10 karakter")
      .default("IDR"),

    is_active: z.boolean().optional().default(true),
  })
  .refine(
    (data) => data.discount_price == null || data.discount_price < data.price,
    {
      message: "Harga diskon harus lebih kecil dari harga asli",
      path: ["discount_price"],
    },
  );

// ✅ ini untuk form (input user)
export type PackageFormInput = z.input<typeof packageSchema>;

// ✅ ini untuk hasil final (sudah keisi default)
export type PackageFormOutput = z.output<typeof packageSchema>;
