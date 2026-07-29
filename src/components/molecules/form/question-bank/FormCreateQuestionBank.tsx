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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Controller, useFieldArray, useForm } from "react-hook-form";

import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import { stripHtmlToPreviewText } from "@/utils/rich-text";

import {
  questionBankSchema,
  QuestionBankType,
} from "@/validators/question-bank/question-bank-validator";

import { useCreateQuestionBank } from "@/http/question-bank/create-question-bank";
import { useSession } from "next-auth/react";
import { useGetAllSubtest } from "@/http/subtest/get-all-subtest";

import { useState } from "react";

const optionKeys = ["A", "B", "C", "D", "E"] as const;

const difficultyOptions = [
  { label: "Mudah", value: "easy" },
  { label: "Sedang", value: "medium" },
  { label: "Sulit", value: "hard" },
];

export default function FormCreateQuestionBank() {
  const { data: session, status } = useSession();

  const [openSubtest, setOpenSubtest] = useState(false);

  const [questionPreview, setQuestionPreview] = useState<string | null>(null);
  const [discussionPreview, setDiscussionPreview] = useState<string | null>(
    null,
  );

  const { data } = useGetAllSubtest({
    token: session?.access_token as string,
    options: {
      enabled: status === "authenticated",
    },
  });

  const form = useForm<QuestionBankType>({
    resolver: zodResolver(questionBankSchema),
    mode: "onChange",
    defaultValues: {
      subtest_id: "",
      question_text: "",
      discussion: "",
      difficulty: "",
      correct_answer: "A",
      is_active: true,
      options: [
        { option_key: "A", option_text: "" },
        { option_key: "B", option_text: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: createQuestionHandler, isPending } = useCreateQuestionBank({
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Terjadi kesalahan.");

      toast.error("Gagal membuat soal!", {
        description: message,
      });
    },
    onSuccess: () => {
      toast.success("Soal berhasil dibuat!");

      queryClient.invalidateQueries({
        queryKey: ["get-all-question-banks"],
      });

      router.push("/dashboard/admin/question-bank");
    },
  });

  const onSubmit = (body: QuestionBankType) => {
    createQuestionHandler({ body });
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid md:grid-cols-2 gap-6">
            {/* SUBTEST */}
            <Controller
              control={form.control}
              name="subtest_id"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Subtest <span className="text-red-500">*</span>
                  </FieldLabel>

                  <Popover open={openSubtest} onOpenChange={setOpenSubtest}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {field.value
                          ? data?.data?.find((item) => item.id === field.value)
                              ?.name
                          : "Pilih subtest"}

                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Cari subtest..." />
                        <CommandEmpty>Subtest tidak ditemukan</CommandEmpty>

                        <CommandGroup>
                          {data?.data?.map((subtest) => (
                            <CommandItem
                              key={subtest.id}
                              value={subtest.name}
                              onSelect={() => {
                                field.onChange(subtest.id);
                                setOpenSubtest(false);
                              }}
                            >
                              {subtest.name}

                              <Check
                                className={cn(
                                  "ml-auto",
                                  field.value === subtest.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="difficulty"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tingkat Kesulitan</FieldLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat kesulitan" />
                    </SelectTrigger>

                    <SelectContent>
                      {difficultyOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* QUESTION */}
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

            {/* QUESTION IMAGE */}
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

            {/* OPTIONS */}
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
                    })
                  }
                  disabled={fields.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3">
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
            </div>

            {/* CORRECT ANSWER */}
            <Controller
              control={form.control}
              name="correct_answer"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Jawaban Benar</FieldLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
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

            {/* DISCUSSION */}
            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="discussion"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Pembahasan</FieldLabel>

                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tulis pembahasan..."
                    />
                  </Field>
                )}
              />
            </div>

            {/* DISCUSSION IMAGE */}
            <Controller
              control={form.control}
              name="discussion_image"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Gambar Pembahasan</FieldLabel>

                  <Input
                    type="file"
                    accept="image/*"
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
