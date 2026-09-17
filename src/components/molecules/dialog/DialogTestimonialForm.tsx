"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  testimonialSchema,
  TestimonialFormInput,
} from "@/validators/testimonials/testimonial-validator";
import { Testimonial, TestimonialColorTheme } from "@/types/testimonials/testimonial";
import { useCreateTestimonial } from "@/http/testimonials/create-testimonial";
import { useUpdateTestimonial } from "@/http/testimonials/update-testimonial";
import { ImagePlus, X } from "lucide-react";

interface DialogTestimonialFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedTestimonial?: Testimonial | null;
  onSuccess?: () => void;
}

const COLOR_THEMES: { label: string; value: TestimonialColorTheme; bg: string }[] = [
  { label: "Pink", value: "pink", bg: "#fce7f3" },
  { label: "Yellow", value: "yellow", bg: "#fef9c3" },
  { label: "Mint", value: "mint", bg: "#d1fae5" },
  { label: "Blue", value: "blue", bg: "#dbeafe" },
  { label: "Lavender", value: "lavender", bg: "#ede9fe" },
  { label: "Cream", value: "cream", bg: "#f1f5f9" },
];

export default function DialogTestimonialForm({
  open,
  setOpen,
  selectedTestimonial,
  onSuccess,
}: DialogTestimonialFormProps) {
  const isEdit = !!selectedTestimonial;
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  const previewImage = isAvatarRemoved
    ? null
    : (customAvatarPreview ?? selectedTestimonial?.avatar_url ?? null);

  const form = useForm<TestimonialFormInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      role: "",
      program: "UTBK-SNBT",
      quote: "",
      rating: 5,
      color_theme: "pink",
      order_no: 0,
      is_active: true,
      avatar: null,
      avatar_bg: "#be185d",
    },
  });

  useEffect(() => {
    if (selectedTestimonial) {
      form.reset({
        name: selectedTestimonial.name,
        role: selectedTestimonial.role,
        program: selectedTestimonial.program,
        quote: selectedTestimonial.quote,
        rating: selectedTestimonial.rating,
        color_theme: selectedTestimonial.color_theme,
        order_no: selectedTestimonial.order_no,
        is_active: selectedTestimonial.is_active,
        avatar_bg: selectedTestimonial.avatar_bg || "#be185d",
        avatar: null,
      });
    } else {
      form.reset({
        name: "",
        role: "",
        program: "UTBK-SNBT",
        quote: "",
        rating: 5,
        color_theme: "pink",
        order_no: 0,
        is_active: true,
        avatar_bg: "#be185d",
        avatar: null,
      });
    }
  }, [selectedTestimonial, open, form]);

  const { mutate: createTestimonial, isPending: isCreating } = useCreateTestimonial({
    onSuccess: () => {
      toast.success("Testimoni berhasil ditambahkan!");
      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menambahkan testimoni.");
    },
  });

  const { mutate: updateTestimonial, isPending: isUpdating } = useUpdateTestimonial({
    onSuccess: () => {
      toast.success("Testimoni berhasil diperbarui!");
      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui testimoni.");
    },
  });

  const isPending = isCreating || isUpdating;

  const onSubmit = (values: TestimonialFormInput) => {
    if (isEdit && selectedTestimonial) {
      updateTestimonial({
        id: selectedTestimonial.id,
        body: values,
      });
    } else {
      createTestimonial(values);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file gambar maksimal 2MB");
        return;
      }
      form.setValue("avatar", file);
      setIsAvatarRemoved(false);
      setCustomAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    form.setValue("avatar", null);
    setCustomAvatarPreview(null);
    setIsAvatarRemoved(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCustomAvatarPreview(null);
      setIsAvatarRemoved(false);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Testimoni" : "Tambah Testimoni Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="space-y-3">
            {/* Nama & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Nama Siswa</FieldLabel>
                <Input
                  {...form.register("name")}
                  placeholder="Contoh: Rizky Pratama"
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field>
                <FieldLabel>Status / Info Kelulusan</FieldLabel>
                <Input
                  {...form.register("role")}
                  placeholder="Contoh: Lolos FK UI 2024"
                />
                <FieldError errors={[form.formState.errors.role]} />
              </Field>
            </div>

            {/* Program & Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Program</FieldLabel>
                <Controller
                  control={form.control}
                  name="program"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTBK-SNBT">UTBK-SNBT</SelectItem>
                        <SelectItem value="CPNS">CPNS</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.program]} />
              </Field>

              <Field>
                <FieldLabel>Rating Bintang (1 - 5)</FieldLabel>
                <Controller
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <Select
                      value={String(field.value ?? 5)}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Bintang)</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ (4 Bintang)</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ (3 Bintang)</SelectItem>
                        <SelectItem value="2">⭐⭐ (2 Bintang)</SelectItem>
                        <SelectItem value="1">⭐ (1 Bintang)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.rating]} />
              </Field>
            </div>

            {/* Quote / Ulasan */}
            <Field>
              <FieldLabel>Isi Ulasan Siswa (Quote)</FieldLabel>
              <Textarea
                {...form.register("quote")}
                placeholder="Tulis ulasan/kesan siswa di sini..."
                rows={3}
              />
              <FieldError errors={[form.formState.errors.quote]} />
            </Field>

            {/* Tema Warna & Urutan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Tema Warna Sticker</FieldLabel>
                <Controller
                  control={form.control}
                  name="color_theme"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Tema Warna" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_THEMES.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border"
                                style={{ backgroundColor: theme.bg }}
                              />
                              <span>{theme.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.color_theme]} />
              </Field>

              <Field>
                <FieldLabel>Urutan Tampil (Order No)</FieldLabel>
                <Input
                  type="number"
                  {...form.register("order_no", { valueAsNumber: true })}
                  placeholder="0"
                />
                <FieldError errors={[form.formState.errors.order_no]} />
              </Field>
            </div>

            {/* Foto Profil (Opsional) */}
            <Field>
              <FieldLabel>Foto Profil Siswa (Opsional)</FieldLabel>
              <div className="flex items-center gap-4">
                {previewImage ? (
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border">
                    <img
                      src={previewImage}
                      alt="Preview Avatar"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-14 h-14 border border-dashed rounded-full cursor-pointer hover:bg-muted text-muted-foreground">
                    <ImagePlus className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
                <span className="text-xs text-muted-foreground">
                  Format JPG, PNG, atau WebP. Maks 2MB. Jika dikosongkan, akan
                  menggunakan inisial nama.
                </span>
              </div>
            </Field>

            {/* Status Aktif */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Status Aktif</span>
                <p className="text-xs text-muted-foreground">
                  Hanya testimoni aktif yang akan muncul di Landing Page.
                </p>
              </div>
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
