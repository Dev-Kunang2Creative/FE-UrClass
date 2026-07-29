import z from "zod";

export const questionSubtestTryoutSchema = z.object({
  question_bank_id: z.string().min(1, "Subtest wajib dipilih"),
  order_no: z.number().min(1, "Urutan minimal 1"),
  is_active: z.boolean(),
});

export type QuestionSubtestTryoutType = z.infer<
  typeof questionSubtestTryoutSchema
>;
