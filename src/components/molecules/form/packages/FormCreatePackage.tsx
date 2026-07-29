// components/packages/FormCreatePackage.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { useEffect, useRef, useState } from "react";
import { useCreatePackage } from "@/http/packages/create-package";
import {
  PackageFormInput,
  packageSchema,
} from "@/validators/packages/package-validator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/constants/currency";
import { ImagePlus, X } from "lucide-react";

export default function FormCreatePackage() {
  const form = useForm<PackageFormInput>({
    resolver: zodResolver(packageSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      discount_price: null,
      currency: "IDR",
      ticket_amount: 1,
      is_active: true,
      thumbnail: null,
    },
  });

  const nameValue = form.watch("name");
  useEffect(() => {
    const generatedSlug = nameValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    form.setValue("slug", generatedSlug, { shouldValidate: true });
  }, [nameValue, form]);

  const queryClient = useQueryClient();
  const router = useRouter();

  // Thumbnail preview state
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createPackageHandler, isPending } = useCreatePackage({
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Terjadi kesalahan.");
      toast.error("Gagal menambahkan package!", { description: message });
    },
    onSuccess: () => {
      toast.success("Berhasil menambahkan package!");
      queryClient.invalidateQueries({ queryKey: ["get-all-packages"] });
      router.push("/dashboard/admin/packages");
    },
  });

  const onSubmit = (body: PackageFormInput) => {
    createPackageHandler(body);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    form.setValue("thumbnail", file, { shouldValidate: true });
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
  };

  const removeThumbnail = () => {
    form.setValue("thumbnail", null, { shouldValidate: true });
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid md:grid-cols-2 gap-6">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Nama Package <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input {...field} placeholder="Masukkan nama package" />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Slug <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input {...field} placeholder="otomatis-dari-nama" />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                      placeholder="Masukkan deskripsi package"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="md:col-span-2">
              <Controller
                control={form.control}
                name="thumbnail"
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Thumbnail</FieldLabel>
                    <div className="flex flex-col gap-3">
                      {thumbnailPreview ? (
                        <div className="relative w-full max-w-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbnailPreview}
                            alt="Preview thumbnail"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={removeThumbnail}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center w-full max-w-sm h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors gap-2 text-muted-foreground"
                        >
                          <ImagePlus className="w-8 h-8" />
                          <span className="text-sm font-medium">
                            Pilih Gambar
                          </span>
                          <span className="text-xs">
                            JPG, JPEG, PNG, WEBP · Maks 2MB
                          </span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {!thumbnailPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Upload Thumbnail
                        </Button>
                      )}
                    </div>
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
                    placeholder="Masukkan harga"
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
                        e.target.value === "" ? null : e.target.valueAsNumber,
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
              name="currency"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Mata Uang <span className="text-red-500">*</span>
                  </FieldLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>

                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          <span className="flex items-center gap-2">
                            <span>{currency.flag}</span>
                            <span>{currency.label}</span>
                          </span>
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

            <Controller
              control={form.control}
              name="ticket_amount"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Jumlah Tiket <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    placeholder="Masukkan jumlah tiket"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
              {isPending ? "Loading..." : "Tambahkan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
