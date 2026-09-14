import { z } from "zod";
import { optionalQuestionImageSchema } from "@/validators/questions/image-validator";

const optionKeys = ["A", "B", "C", "D", "E"] as const;

export const questionOptionSchema = z
  .object({
    option_key: z.enum(optionKeys, {
      message: "Option key harus A, B, C, D, atau E",
    }),
    option_text: z.string(),
    /** Gambar opsi; melengkapi teksnya, bukan menggantikan. */
    image: optionalQuestionImageSchema,
  })
  .superRefine((option, ctx) => {
    // Boleh bergambar saja, bertulisan saja, atau keduanya - yang tidak boleh
    // adalah kosong sama sekali.
    if (option.option_text.trim() === "" && !(option.image instanceof File)) {
      ctx.addIssue({
        code: "custom",
        message: "Isi opsi dengan teks atau gambar",
        path: ["option_text"],
      });
    }
  });

export const questionBankSchema = z
  .object({
    subtest_id: z.string().min(1, "Subtest wajib dipilih"),

    question_text: z.string().min(1, "Soal wajib diisi"),

    question_image: optionalQuestionImageSchema,

    discussion: z.string().optional(),

    discussion_image: optionalQuestionImageSchema,

    correct_answer: z.enum(optionKeys, {
      message: "Jawaban benar harus A-E",
    }),

    difficulty: z.string().max(50).optional(),

    is_active: z.boolean().optional(),

    options: z.array(questionOptionSchema).min(2, "Minimal 2 opsi jawaban"),
  })
  .superRefine((data, ctx) => {
    const keys = data.options.map((o) => o.option_key);

    const unique = new Set(keys);

    if (unique.size !== keys.length) {
      ctx.addIssue({
        code: "custom",
        message: "option_key tidak boleh duplikat",
        path: ["options"],
      });
    }

    if (!keys.includes(data.correct_answer)) {
      ctx.addIssue({
        code: "custom",
        message: "correct_answer harus ada di dalam options",
        path: ["correct_answer"],
      });
    }
  });

export type QuestionBankType = z.infer<typeof questionBankSchema>;
