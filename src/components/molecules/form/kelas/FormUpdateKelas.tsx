"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useSession } from "next-auth/react";
import { kelasSchema, KelasFormType } from "@/validators/kelas/kelas-validator";
import { useGetDetailKelasAdmin } from "@/http/kelas/get-detail-kelas-admin";
import { useUpdateKelasAdmin } from "@/http/kelas/update-kelas-admin";

interface FormUpdateKelasProps {
  kelasId: string;
}

export default function FormUpdateKelas({ kelasId }: FormUpdateKelasProps) {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const { data: detailData, isPending: isLoadingDetail, isError: isDetailError } = useGetDetailKelasAdmin({
    id: kelasId,
    token,
  });

  const defaultData = detailData?.data;

  const form = useForm<KelasFormType>({
    resolver: zodResolver(kelasSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount_price: null,
      ticket_amount: 0,
      wa_group_link: "",
      wa_consultation_number: "",
      meet_link: "",
      image: null,
      is_active: true,
    },
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

  useEffect(() => {
    if (!defaultData) return;
    form.reset({
      name: defaultData.name ?? "",
      description: defaultData.description ?? "",
      price: defaultData.price ?? 0,
      discount_price: defaultData.discount_price && defaultData.discount_price > 0 ? defaultData.discount_price : null,
      ticket_amount: defaultData.ticket_amount ?? 0,
      wa_group_link: defaultData.wa_group_link ?? "",
      wa_consultation_number: defaultData.wa_consultation_number ?? "",
      meet_link: defaultData.meet_link ?? "",
      image: null,
      is_active: defaultData.is_active ?? true,
    });
    if (defaultData.image_url) {
      setPreview(defaultData.image_url);
    }
  }, [defaultData, form]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: updateKelasHandler, isPending } = useUpdateKelasAdmin({
    token,
    options: {
      onError: (error: unknown) => {
        const message = getErrorMessage(error, "Terjadi kesalahan.");
        toast.error("Gagal memperbarui kelas!", { description: message });
      },
      onSuccess: () => {
        toast.success("Berhasil memperbarui kelas!");
        queryClient.invalidateQueries({ queryKey: ["get-all-kelas-admin"] });
        queryClient.invalidateQueries({
          queryKey: ["get-detail-kelas-admin", kelasId],
        });
        router.push("/dashboard/admin/kelas");
      },
    },
  });

  const onSubmit = (body: KelasFormType) => {
    updateKelasHandler({ id: kelasId, body });
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

  if (isDetailError) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-red-500">
          Gagal memuat data kelas. Pastikan koneksi server aktif dan coba lagi.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Nama Kelas <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input {...field} placeholder="Masukkan nama kelas" />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Deskripsi</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Masukkan deskripsi kelas"
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
              name="price"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Harga <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    placeholder="Masukkan harga (0 jika gratis)"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="discount_price"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Harga Diskon</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.valueAsNumber
                      )
                    }
                    placeholder="Kosongkan jika tidak ada diskon"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="ticket_amount"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Bonus Tiket Tryout</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    placeholder="Jumlah tiket bonus (0 jika tidak ada)"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="wa_group_link"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Link Grup WA</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="https://chat.whatsapp.com/..."
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="wa_consultation_number"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nomor WA Konsultasi</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="628123456789"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="meet_link"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Link Google Meet</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="https://meet.google.com/..."
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
                name="image"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Thumbnail Kelas</FieldLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
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
            </div>

            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value ? "Aktif" : "Nonaktif"}
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
