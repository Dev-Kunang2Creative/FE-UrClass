import { z } from "zod";

const optionKeys = ["A", "B", "C", "D", "E"] as const;

export const questionOptionSchema = z.object({
  option_key: z.enum(optionKeys, {
    message: "Option key harus A, B, C, D, atau E",
  }),
  option_text: z.string().min(1, "Isi opsi wajib diisi"),
});

export const questionSchema = z
  .object({
    order_no: z.number().min(1, "Urutan minimal 1"),
    question_type: z.enum(["multiple_choice", "essay"]),
    question_text: z.string().min(1, "Soal wajib diisi"),

    question_image: z.instanceof(File).optional().nullable(),
    delete_question_image: z.boolean().optional(),

    discussion: z.string().optional(),

    discussion_image: z.instanceof(File).optional().nullable(),
    delete_discussion_image: z.boolean().optional(),

    correct_answer: z.enum(optionKeys).optional().nullable(),

    is_active: z.boolean().optional(),

    options: z.array(questionOptionSchema),
  })
  .superRefine((data, ctx) => {
    if (data.question_type === "essay") return;

    if (data.options.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Minimal 2 opsi jawaban",
        path: ["options"],
      });
    }

    if (!data.correct_answer) {
      ctx.addIssue({
        code: "custom",
        message: "Jawaban benar wajib diisi",
        path: ["correct_answer"],
      });
      return;
    }

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

export type QuestionType = z.infer<typeof questionSchema>;
