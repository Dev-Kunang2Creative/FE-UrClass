import { z } from "zod";
import { optionalQuestionImageSchema } from "./image-validator";

const optionKeys = ["A", "B", "C", "D", "E"] as const;

/** Skala bobot TKP SKD. Sama dengan ScoringService di backend. */
export const OPTION_WEIGHT_MIN = 1;
export const OPTION_WEIGHT_MAX = 5;

export const questionOptionSchema = z.object({
  option_key: z.enum(optionKeys, {
    message: "Option key harus A, B, C, D, atau E",
  }),
  option_text: z.string().min(1, "Isi opsi wajib diisi"),
  /** Hanya dipakai subtes berskema option_weight. */
  score: z.number().optional().nullable(),
});

/**
 * Aturan soal, berbeda menurut skema penilaian subtesnya.
 *
 * Pada subtes berbobot per opsi (TKP SKD) tidak ada "kunci jawaban": kelima
 * opsi bernilai 1-5 dan yang tertinggi dianggap paling ideal. Karena itu
 * kunci jawaban tidak divalidasi di sana - backend menurunkannya sendiri dari
 * bobot tertinggi, supaya kunci dan bobot tidak mungkin bertentangan.
 */
export const makeQuestionSchema = (weighted: boolean) =>
  z
    .object({
      order_no: z.number().min(1, "Urutan minimal 1"),
      question_type: z.enum(["multiple_choice", "essay"]),
      question_text: z.string().min(1, "Soal wajib diisi"),

      question_image: optionalQuestionImageSchema,
      delete_question_image: z.boolean().optional(),

      discussion: z.string().optional(),

      discussion_image: optionalQuestionImageSchema,
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

      const keys = data.options.map((o) => o.option_key);
      const unique = new Set(keys);

      if (unique.size !== keys.length) {
        ctx.addIssue({
          code: "custom",
          message: "option_key tidak boleh duplikat",
          path: ["options"],
        });
      }

      if (weighted) {
        const scores = data.options.map((o) => o.score);

        scores.forEach((score, index) => {
          if (
            score == null ||
            !Number.isInteger(score) ||
            score < OPTION_WEIGHT_MIN ||
            score > OPTION_WEIGHT_MAX
          ) {
            ctx.addIssue({
              code: "custom",
              message: `Bobot wajib diisi ${OPTION_WEIGHT_MIN}-${OPTION_WEIGHT_MAX}`,
              path: ["options", index, "score"],
            });
          }
        });

        const filled = scores.filter((s): s is number => s != null);

        if (filled.length === scores.length) {
          if (new Set(filled).size !== filled.length) {
            ctx.addIssue({
              code: "custom",
              message:
                "Bobot antar opsi tidak boleh kembar: pakai 1 sampai 5 masing-masing sekali",
              path: ["options"],
            });
          }

          if (!filled.includes(OPTION_WEIGHT_MAX)) {
            ctx.addIssue({
              code: "custom",
              message: `Harus ada satu opsi bernilai ${OPTION_WEIGHT_MAX} sebagai respons paling ideal`,
              path: ["options"],
            });
          }
        }

        return;
      }

      if (!data.correct_answer) {
        ctx.addIssue({
          code: "custom",
          message: "Jawaban benar wajib diisi",
          path: ["correct_answer"],
        });
        return;
      }

      if (!keys.includes(data.correct_answer)) {
        ctx.addIssue({
          code: "custom",
          message: "correct_answer harus ada di dalam options",
          path: ["correct_answer"],
        });
      }
    });

/** Skema benar/salah, dipakai di tempat yang tidak bergantung subtes. */
export const questionSchema = makeQuestionSchema(false);

export type QuestionType = z.infer<typeof questionSchema>;
