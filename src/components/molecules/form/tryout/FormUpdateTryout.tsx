"use client";

import { useEffect, useMemo, useState } from "react";
import { compressImage } from "@/utils/compress-image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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

import { tryoutSchema, TryoutType } from "@/validators/tryout/tryout-validator";
import { useUpdateTryout } from "@/http/tryout/update-tryout";
import { useGetDetailTryout } from "@/http/tryout/get-detail-tryout";

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
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { id } from "date-fns/locale";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface FormEditTryoutProps {
  tryoutId: string;
}

export default function FormEditTryout({ tryoutId }: FormEditTryoutProps) {
  const { data: session } = useSession();
  const [preview, setPreview] = useState<string | null>(null);

  const { data: detailData, isPending: isLoadingDetail } = useGetDetailTryout({
    id: tryoutId,
    token: session?.access_token as string,
  });

  const defaultData = useMemo(() => detailData?.data, [detailData]);

  const normalizeCategory = (category: string | null | undefined): "UTBK" | "UM" => {
    const normalized = category?.trim().toUpperCase();
    return normalized === "UM" ? "UM" : "UTBK";
  };

  const form = useForm<TryoutType>({
    resolver: zodResolver(tryoutSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "UTBK",
      start_date: "",
      end_date: "",
      is_published: false,
      is_free: false,
      use_irt: true,
      randomize_options: false,
      image: null,
    },
    mode: "onChange",
  });

  const formatDate = (value: string | Date | null | undefined) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!defaultData) return;

    form.reset({
      title: defaultData.title ?? "",
      description: defaultData.description ?? "",
      category: normalizeCategory(defaultData.category),
      start_date: formatDate(defaultData.start_date),
      end_date: formatDate(defaultData.end_date),
      is_published: defaultData.is_published ?? false,
      is_free: defaultData.is_free ?? false,
      use_irt: defaultData.use_irt ?? true,
      randomize_options: defaultData.randomize_options ?? false,
      image: null,
    });

    if (defaultData.image_url) setPreview(defaultData.image_url);
  }, [defaultData, form]);

  const image = form.watch("image");
  useEffect(() => {
    if (image instanceof File) {
      const url = URL.createObjectURL(image);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: updateTryoutHandler, isPending } = useUpdateTryout({
    onError: (error) => {
      const message = error.response?.data.message ?? "Terjadi kesalahan.";
      toast.error("Gagal memperbarui tryout!", { description: message });
    },
    onSuccess: () => {
      toast.success("Berhasil memperbarui tryout!");
      queryClient.invalidateQueries({ queryKey: ["get-all-tryouts"] });
      queryClient.invalidateQueries({
        queryKey: ["get-detail-tryouts", tryoutId],
      });
      router.push("/dashboard/admin/try-out");
    },
  });

  const onSubmit = (body: TryoutType) => {
    updateTryoutHandler({
      id: tryoutId,
      body: {
        ...body,
        category: body.category ?? normalizeCategory(defaultData?.category),
      },
    });
  };

  if (isLoadingDetail) {
    return (
      <Card>
        <CardContent className="space-y-6 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
        <form
          key={defaultData?.id ?? "loading"}
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Judul Tryout <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input {...field} placeholder="Masukkan judul tryout" />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Deskripsi</FieldLabel>
                  <Input {...field} placeholder="Masukkan deskripsi tryout" />
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
                  <FieldLabel>Kategori</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "UTBK"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTBK">UTBK</SelectItem>
                      <SelectItem value="UM">UM</SelectItem>
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
              name="start_date"
              render={({ field, fieldState }) => {
                const date = field.value ? new Date(field.value) : undefined;
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Tanggal Mulai</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date
                            ? format(date, "dd MMMM yyyy", { locale: id })
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => {
                            if (!d) return;
                            field.onChange(format(d, "yyyy-MM-dd"));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />

            <Controller
              control={form.control}
              name="end_date"
              render={({ field, fieldState }) => {
                const date = field.value ? new Date(field.value) : undefined;
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Tanggal Selesai</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date
                            ? format(date, "dd MMMM yyyy", { locale: id })
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => {
                            if (!d) return;
                            field.onChange(format(d, "yyyy-MM-dd"));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />

            <Controller
              control={form.control}
              name="image"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Thumbnail Tryout</FieldLabel>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const compressed = await compressImage(file);
                        field.onChange(compressed);
                      } catch {
                        toast.error("Gagal mengompresi gambar. Coba file lain.");
                        e.target.value = "";
                      }
                    }}
                  />
                  {preview && (
                    <Image
                      src={preview}
                      alt="preview"
                      className="mt-3 border max-h-64 object-contain rounded-lg"
                      width={640}
                      height={160}
                    />
                  )}
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Status Publikasi</FieldLabel>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value ? "Dipublikasikan" : "Draft"}
                    </span>
                  </div>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="is_free"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Gratis / Berbayar?</FieldLabel>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value ? "Gratis" : "Berbayar"}
                    </span>
                  </div>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="use_irt"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Gunakan Skoring IRT?</FieldLabel>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value
                        ? "IRT — skor dihitung berdasarkan tingkat kesulitan soal"
                        : "Tanpa IRT — hanya tampilkan jumlah benar/salah"}
                    </span>
                  </div>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="randomize_options"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Acak Opsi Jawaban</FieldLabel>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value
                        ? "Opsi jawaban diacak untuk setiap sesi peserta"
                        : "Opsi jawaban tampil berurutan A-E"}
                    </span>
                  </div>
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
