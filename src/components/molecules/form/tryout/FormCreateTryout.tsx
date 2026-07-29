"use client";

import { useEffect, useState } from "react";
import { compressImage } from "@/utils/compress-image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

import { tryoutSchema, TryoutType } from "@/validators/tryout/tryout-validator";
import { useCreateTryout } from "@/http/tryout/create-tryout";

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

export default function FormCreateTryout() {
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

  const [preview, setPreview] = useState<string | null>(null);

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

  const { mutate: createItemHandler, isPending } = useCreateTryout({
    onError: (error) => {
      const message = error.response?.data.message ?? "Terjadi kesalahan.";

      toast.error("Gagal menambahkan tryout!", {
        description: message,
      });
    },
    onSuccess: () => {
      toast.success("Berhasil menambahkan tryout!");

      queryClient.invalidateQueries({
        queryKey: ["get-all-tryouts"],
      });

      router.push("/dashboard/admin/try-out");
    },
  });

  const onSubmit = (body: TryoutType) => {
    createItemHandler(body);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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

                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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
                    <img
                      src={preview}
                      alt="preview"
                      className="mt-3 h-40 w-full rounded-lg object-cover border"
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
              {isPending ? "Loading..." : "Tambahkan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
