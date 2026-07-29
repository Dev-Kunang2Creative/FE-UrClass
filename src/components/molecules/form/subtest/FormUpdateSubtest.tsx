// components/subtest/FormUpdateSubtest.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  subtestSchema,
  SubtestType,
} from "@/validators/subtest/subtest-validator";
import { useGetDetailSubtest } from "@/http/subtest/get-detail-subtest";
import { useUpdateSubtest } from "@/http/subtest/update-subtest";

interface FormUpdateSubtestProps {
  subtestId: string;
}

export default function FormUpdateSubtest({
  subtestId,
}: FormUpdateSubtestProps) {
  const { data: session } = useSession();

  const { data: detailData, isPending: isLoadingDetail } = useGetDetailSubtest({
    id: subtestId,
    token: session?.access_token as string,
  });

  const defaultData = useMemo(() => detailData?.data, [detailData]);

  const form = useForm<SubtestType>({
    resolver: zodResolver(subtestSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      category: "",
      max_questions: 15,
    },
  });

  useEffect(() => {
    if (!defaultData) return;

    form.reset({
      name: defaultData.name ?? "",
      category: defaultData.category ?? "",
      max_questions: defaultData.max_questions ?? 15,
    });
  }, [defaultData, form]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: updateSubtestHandler, isPending } = useUpdateSubtest({
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Terjadi kesalahan.");
      toast.error("Gagal memperbarui subtes!", { description: message });
    },
    onSuccess: () => {
      toast.success("Berhasil memperbarui subtes!");
      queryClient.invalidateQueries({ queryKey: ["get-all-subtests"] });
      queryClient.invalidateQueries({
        queryKey: ["get-detail-subtest", subtestId],
      });
      router.push("/dashboard/admin/subtest");
    },
  });

  const onSubmit = (body: SubtestType) => {
    updateSubtestHandler({ id: subtestId, body });
  };

  if (isLoadingDetail) {
    return (
      <Card>
        <CardContent className="space-y-6 pt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex justify-end">
            <Skeleton className="h-11 w-36 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  <Input {...field} placeholder="Masukkan nama subtes" />
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
                    key={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
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

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
