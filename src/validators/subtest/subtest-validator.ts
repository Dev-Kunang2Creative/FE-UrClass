import z from "zod";

export const subtestSchema = z.object({
  name: z.string().min(1, "Nama subtes wajib diisi"),
  category: z.string().min(1, "Kategori subtes wajib diisi"),
  exam_type: z.enum(["utbk", "cpns"], { message: "Jenis ujian wajib dipilih" }),
  max_questions: z.number().min(1, "Jumlah soal maksimal harus lebih dari 0"),
});

export type SubtestType = z.infer<typeof subtestSchema>;
