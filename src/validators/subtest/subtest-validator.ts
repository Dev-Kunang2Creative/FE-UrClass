import z from "zod";

export const subtestSchema = z.object({
  name: z.string().min(1, "Nama subtes wajib diisi"),
  category: z.string().min(1, "Kategori subtes wajib diisi"),
  max_questions: z.number().min(1, "Jumlah soal maksimal harus lebih dari 0"),
});

export type SubtestType = z.infer<typeof subtestSchema>;
