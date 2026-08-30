import z from "zod";

/**
 * Skema penilaian satu jawaban.
 *
 * "irt" tetap nilai yang sah - seluruh subtes UTBK memakainya - tapi bukan
 * pilihan yang ditawarkan ke admin: skemanya ditentukan jalur ujiannya, dan
 * UTBK selalu IRT.
 */
export const scoringSchemes = ["right_wrong", "option_weight", "irt"] as const;

/** Yang boleh dipilih admin. IRT tidak ada di sini karena tidak dipilih manual. */
export const selectableSchemes = ["right_wrong", "option_weight"] as const;

export const subtestSchema = z.object({
  name: z.string().min(1, "Nama subtes wajib diisi"),
  category: z.string().min(1, "Kategori subtes wajib diisi"),
  exam_type: z.enum(["utbk", "cpns"], { message: "Jenis ujian wajib dipilih" }),
  max_questions: z.number().min(1, "Jumlah soal maksimal harus lebih dari 0"),

  /**
   * Cara subtes ini dinilai. Sebelumnya tidak pernah dikirim, sehingga setiap
   * subtes buatan admin terkunci pada benar/salah - termasuk TKP SKD yang
   * seharusnya dinilai per bobot opsi.
   */
  scoring_scheme: z.enum(scoringSchemes).optional(),
  score_correct: z.number().optional(),
  score_wrong: z.number().optional(),
  score_empty: z.number().optional(),
});

export type SubtestType = z.infer<typeof subtestSchema>;
