"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/atoms/rich-text/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Plus, Scale, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { stripHtmlToPreviewText } from "@/utils/rich-text";
import {
  makeQuestionSchema,
  OPTION_WEIGHT_MAX,
  QuestionType,
} from "@/validators/questions/question-validator";
import { useCreateQuestion } from "@/http/questions/create-question";
import { useGetDetailSubtest } from "@/http/subtest/get-detail-subtest";
import { OPTION_WEIGHT_SCHEME, OptionWeightHint, OptionWeightSelect } from "./OptionWeight";

interface FormCreateQuestionProps {
  id: string;
}

const optionKeys = ["A", "B", "C", "D", "E"] as const;

export default function FormCreateQuestion({ id }: FormCreateQuestionProps) {
  const [questionPreview, setQuestionPreview] = useState<string | null>(null);
  const [discussionPreview, setDiscussionPreview] = useState<string | null>(
    null,
  );

  const { data: session } = useSession();

  // Aturan soal berbeda per skema penilaian subtesnya, jadi form ini perlu tahu
  // subtes mana yang sedang diisi - bukan sekadar id-nya.
  const { data: subtest } = useGetDetailSubtest({
    id,
    token: session?.access_token as string,
  });

  const weighted = subtest?.data?.scoring_scheme === OPTION_WEIGHT_SCHEME;

  // Skema baru diketahui setelah subtes termuat, sementara resolver dibaca
  // sekali saat form dibuat. Ref-nya dibaca ulang tiap validasi.
  const weightedRef = useRef(weighted);
  weightedRef.current = weighted;

  const form = useForm<QuestionType>({
    resolver: (values, context, options) =>
      zodResolver(makeQuestionSchema(weightedRef.current))(
        values,
        context,
        options,
      ),
    mode: "onChange",
    defaultValues: {
      order_no: 1,
      question_type: "multiple_choice",
      question_text: "",
      discussion: "",
      correct_answer: "A",
      is_active: true,
      options: [
        { option_key: "A", option_text: "" },
        { option_key: "B", option_text: "" },
      ],
    },
  });
  const questionType = form.watch("question_type");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  // Soal TKP selalu lima opsi berbobot 1-5, jadi barisnya disiapkan sekaligus
  // ketimbang meminta admin menekan "Tambah" tiga kali untuk setiap soal.
  useEffect(() => {
    if (!weighted) return;

    const options = form.getValues("options");
    const untouched = options.every((option) => !option.option_text);

    if (options.length < optionKeys.length && untouched) {
      form.setValue(
        "options",
        optionKeys.map((key) => ({ option_key: key, option_text: "" })),
      );
    }
  }, [weighted, form]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: createQuestionHandler, isPending } = useCreateQuestion({
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Terjadi kesalahan.");

      toast.error("Gagal membuat soal baru!", {
        description: message,
      });
    },
    onSuccess: () => {
      toast.success("Berhasil membuat soal baru!");

      queryClient.invalidateQueries({
        queryKey: ["get-all-subtests"],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-detail-subtest", id],
      });

      router.push("/dashboard/admin/subtest");
    },
  });

  const onSubmit = (body: QuestionType) => {
    createQuestionHandler({ id, body });
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid md:grid-cols-2 gap-6">
            <Controller
              control={form.control}
              name="question_type"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Tipe Soal</FieldLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe soal" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="multiple_choice">Pilihan Ganda</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="order_no"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Urutan Soal <span className="text-red-500">*</span>
                  </FieldLabel>

                  <Input
                    type="number"
                    min={1}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    placeholder="Masukkan urutan soal"
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="question_text"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Soal <span className="text-red-500">*</span>
                    </FieldLabel>

                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tulis soal..."
                    />

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="question_image"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Gambar Soal</FieldLabel>

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      field.onChange(file);

                      if (file) {
                        setQuestionPreview(URL.createObjectURL(file));
                      }
                    }}
                  />

                  {questionPreview && (
                    <div className="mt-3 relative w-fit">
                      <img
                        src={questionPreview}
                        alt="Preview soal"
                        className="rounded-md border max-h-64 object-contain"
                      />

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setQuestionPreview(null);
                          form.setValue("question_image", null);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Field>
              )}
            />

            {questionType === "multiple_choice" && (
              <>
                <div className="md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <FieldLabel>Opsi Jawaban</FieldLabel>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        append({
                          option_key: optionKeys[fields.length],
                          option_text: "",
                          score: null,
                        })
                      }
                      disabled={fields.length >= 5}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah
                    </Button>
                  </div>

                  {weighted && <OptionWeightHint />}

                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      // 10rem, bukan 7rem: label bobot terpanjang
                      // ("5 - paling ideal") tidak muat di 7rem. minmax(0,1fr)
                      // supaya kolom teks opsi boleh menyusut, bukan mendesak
                      // kolom di sebelahnya.
                      className={`grid gap-3 ${
                        weighted
                          ? "grid-cols-[minmax(0,1fr)_10rem_auto]"
                          : "grid-cols-[minmax(0,1fr)_auto]"
                      }`}
                    >
                      <Controller
                        control={form.control}
                        name={`options.${index}.option_text`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={`Opsi ${optionKeys[index]}`}
                          />
                        )}
                      />

                      {weighted && (
                        <Controller
                          control={form.control}
                          name={`options.${index}.score`}
                          render={({ field }) => (
                            <OptionWeightSelect
                              value={field.value ?? null}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      )}

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 2}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {form.formState.errors.options?.message && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.options.message}
                    </p>
                  )}
                </div>

                {weighted ? (
                  <Field>
                    <FieldLabel>Jawaban Benar</FieldLabel>
                    <p className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                      <Scale className="mt-0.5 size-4 shrink-0" />
                      <span>
                        Tidak ada kunci jawaban pada skema ini. Opsi berbobot{" "}
                        {OPTION_WEIGHT_MAX} yang dicatat sebagai jawaban paling
                        ideal.
                      </span>
                    </p>
                  </Field>
                ) : (
                <Controller
                  control={form.control}
                  name="correct_answer"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Jawaban Benar</FieldLabel>

                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jawaban benar" />
                        </SelectTrigger>

                        <SelectContent>
                          {fields.map((option, index) => {
                            const text =
                              stripHtmlToPreviewText(form.watch(`options.${index}.option_text`)) ||
                              "(belum diisi)";

                            return (
                              <SelectItem key={option.id} value={optionKeys[index]}>
                                {optionKeys[index]} - {text}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                )}
              </>
            )}

            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="discussion"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Kunci Jawaban &amp; Pembahasan</FieldLabel>

                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tulis penjelasan kunci jawaban..."
                    />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="discussion_image"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Gambar Kunci Jawaban / Pembahasan</FieldLabel>

                  <p className="text-sm text-muted-foreground">
                    Unggah rumus, diagram, atau penjelasan visual. Format JPG,
                    PNG, atau WebP, maksimal 2 MB.
                  </p>

                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      field.onChange(file);

                      if (file) {
                        setDiscussionPreview(URL.createObjectURL(file));
                      }
                    }}
                  />

                  {discussionPreview && (
                    <div className="mt-3 relative w-fit">
                      <img
                        src={discussionPreview}
                        alt="Preview pembahasan"
                        className="rounded-md border max-h-64 object-contain"
                      />

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setDiscussionPreview(null);
                          form.setValue("discussion_image", null);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Loading..." : "Tambahkan Soal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
