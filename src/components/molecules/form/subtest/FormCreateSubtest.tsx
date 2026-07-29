"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";

import {
  subtestSchema,
  SubtestType,
} from "@/validators/subtest/subtest-validator";
import { useCreateSubtest } from "@/http/subtest/create-subtest";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function FormCreateSubtest() {
  const [actionType, setActionType] = useState<
    "default" | "add-again" | "add-question"
  >("default");

  const form = useForm<SubtestType>({
    resolver: zodResolver(subtestSchema),
    defaultValues: {
      name: "",
      category: "",
      max_questions: 15,
    },
    mode: "onChange",
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: createItemHandler, isPending } = useCreateSubtest({
    onError: (error) => {
      const message = error.response?.data.message ?? "Terjadi kesalahan.";

      toast.error("Gagal menambahkan subtes!", {
        description: message,
      });
    },
    onSuccess: (res) => {
      const id = res?.subtest?.id;

      toast.success("Berhasil menambahkan subtes!");

      queryClient.invalidateQueries({
        queryKey: ["get-all-subtests"],
      });

      if (actionType === "add-again") {
        form.reset();
        router.refresh();
      }

      if (actionType === "add-question") {
        router.push(`/dashboard/admin/subtest/${id}/create`);
      }

      if (actionType === "default") {
        router.push("/dashboard/admin/subtest");
      }
    },
  });

  const onSubmit = (body: SubtestType) => {
    createItemHandler(body);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Nama Subtes <span className="text-red-500">*</span>
                  </FieldLabel>

                  <Input
                    {...field}
                    id="name"
                    placeholder="Masukkan nama subtes"
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Kategori <span className="text-red-500">*</span>
                  </FieldLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="TPS">TPS</SelectItem>
                      <SelectItem value="Literasi">Literasi</SelectItem>
                    </SelectContent>
                  </Select>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="max_questions"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Maksimal Soal <span className="text-red-500">*</span>
                  </FieldLabel>

                  <Input
                    type="number"
                    min={1}
                    placeholder="Masukkan jumlah maksimal soal"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              size="lg"
              variant="outline"
              disabled={isPending}
              onClick={() => setActionType("add-again")}
            >
              Simpan & Tambah Subtes Baru
            </Button>

            <Button
              type="submit"
              size="lg"
              variant="outline"
              disabled={isPending}
              onClick={() => setActionType("add-question")}
            >
              Simpan & Tambah Pertanyaan
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              onClick={() => setActionType("default")}
            >
              Simpan Subtes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
