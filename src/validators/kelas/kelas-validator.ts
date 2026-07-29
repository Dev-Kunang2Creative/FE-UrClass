import z from "zod";

export const kelasSchema = z
  .object({
    name: z.string().min(1, "Nama kelas wajib diisi").max(150),
    description: z.string().optional().nullable(),
    price: z.number().min(0),
    discount_price: z.number().min(1, "Harga diskon minimal Rp1").optional().nullable(),
    ticket_amount: z.number().min(0),
    wa_group_link: z
      .string()
      .url("Link WA group harus URL valid")
      .optional()
      .nullable()
      .or(z.literal("")),
    wa_consultation_number: z.string().optional().nullable(),
    meet_link: z
      .string()
      .url("Link Meet harus URL valid")
      .optional()
      .nullable()
      .or(z.literal("")),
    image: z.instanceof(File).optional().nullable(),
    is_active: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.discount_price != null && data.price > 0) {
        return data.discount_price < data.price;
      }
      return true;
    },
    {
      message: "Harga diskon harus lebih rendah dari harga asli",
      path: ["discount_price"],
    }
  );

export type KelasFormType = z.infer<typeof kelasSchema>;
