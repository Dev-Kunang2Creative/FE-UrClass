import z from "zod";

export const subtestItemSchema = z.object({
  subtest_id: z.string().min(1, "Subtest wajib dipilih"),

  duration_minutes: z.number().min(1, "Durasi minimal 1 menit"),

  is_active: z.boolean(),
});

export const subtestTryoutSchema = z.object({
  subtests: z.array(subtestItemSchema).min(1, "Minimal harus ada 1 subtest"),
});

export type SubtestTryoutType = z.infer<typeof subtestTryoutSchema>;
