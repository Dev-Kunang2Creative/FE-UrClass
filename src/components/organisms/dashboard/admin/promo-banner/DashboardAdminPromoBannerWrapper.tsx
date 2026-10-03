"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAdminPromoBanners,
  useHapusPromoBanner,
  useSimpanPromoBanner,
} from "@/http/promo-banners/promo-banners";
import { getErrorMessage } from "@/utils/get-error-message";
import type {
  BannerKategori,
  PromoBanner,
} from "@/types/promo-banner/promo-banner";

const PILIHAN_JALUR: { nilai: BannerKategori; label: string }[] = [
  { nilai: "semua", label: "Semua jalur" },
  { nilai: "utbk", label: "UTBK - SNBT" },
  { nilai: "cpns", label: "Sekolah Kedinasan & CPNS" },
];

export default function DashboardAdminPromoBannerWrapper() {
  const { data: session } = useSession();
  const token = session?.access_token ?? "";
  const { data: banners, isPending, isError, refetch } = useGetAdminPromoBanners(token);

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 py-10">
        <p role="alert" className="text-sm text-muted-foreground">
          Banner gagal dimuat.
        </p>
        <Button onClick={() => refetch()}>Coba lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BarisBanner token={token} />

      {(banners ?? []).map((banner) => (
        <BarisBanner key={banner.id} token={token} banner={banner} />
      ))}

      {(banners ?? []).length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Belum ada banner. Sampai ada yang diunggah, peserta melihat banner
          bawaan aplikasi.
        </p>
      )}
    </div>
  );
}

function BarisBanner({
  token,
  banner,
}: {
  token: string;
  banner?: PromoBanner;
}) {
  const simpan = useSimpanPromoBanner(token);
  const hapus = useHapusPromoBanner(token);
  const [berkas, setBerkas] = useState<File | null>(null);
  const baru = !banner;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    if (baru && !berkas) {
      toast.error("Pilih gambar banner dulu.");
      return;
    }

    simpan.mutate(
      {
        id: banner?.id,
        image: berkas,
        alt: String(data.get("alt") ?? ""),
        href: String(data.get("href") ?? "/dashboard/try-out"),
        kategori: String(data.get("kategori") ?? "semua"),
        order_no: Number(data.get("order_no") ?? 0),
        is_active: data.get("is_active") === "on",
      },
      {
        onSuccess: () => {
          toast.success(baru ? "Banner ditambahkan." : "Banner tersimpan.");
          setBerkas(null);
          if (baru) event.currentTarget?.reset?.();
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, "Gagal menyimpan banner.")),
      },
    );
  };

  return (
    <Card>
      <CardContent className="py-6">
        <form className="grid gap-4 md:grid-cols-[14rem_1fr]" onSubmit={onSubmit}>
          <div className="space-y-2">
            {/* Rasio 16:9, sama seperti tampilnya di beranda - supaya admin
                melihat potongan yang benar-benar akan dilihat peserta. */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              {berkas || banner?.image_url ? (
                <img
                  src={berkas ? URL.createObjectURL(berkas) : (banner?.image_url ?? "")}
                  alt={banner?.alt ?? "Pratinjau banner"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Belum ada gambar
                </span>
              )}
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ImagePlus className="size-4" />
              {baru ? "Pilih gambar" : "Ganti gambar"}
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setBerkas(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={`alt-${banner?.id ?? "baru"}`}>
                  Keterangan gambar
                </FieldLabel>
                <Input
                  id={`alt-${banner?.id ?? "baru"}`}
                  name="alt"
                  defaultValue={banner?.alt ?? ""}
                  maxLength={150}
                  placeholder="Contoh: Promo tryout hemat"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`kategori-${banner?.id ?? "baru"}`}>
                  Tampil di jalur
                </FieldLabel>
                <Select name="kategori" defaultValue={banner?.kategori ?? "semua"}>
                  <SelectTrigger id={`kategori-${banner?.id ?? "baru"}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PILIHAN_JALUR.map((pilihan) => (
                      <SelectItem key={pilihan.nilai} value={pilihan.nilai}>
                        {pilihan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor={`href-${banner?.id ?? "baru"}`}>
                  Tautan tujuan
                </FieldLabel>
                <Input
                  id={`href-${banner?.id ?? "baru"}`}
                  name="href"
                  defaultValue={banner?.href ?? "/dashboard/try-out"}
                  maxLength={150}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`order-${banner?.id ?? "baru"}`}>
                  Urutan
                </FieldLabel>
                <Input
                  id={`order-${banner?.id ?? "baru"}`}
                  name="order_no"
                  type="number"
                  min={0}
                  max={999}
                  defaultValue={banner?.order_no ?? 0}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch name="is_active" defaultChecked={banner?.is_active ?? true} />
                Tampilkan
              </label>

              <div className="flex gap-2">
                {banner && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={hapus.isPending}
                    onClick={() =>
                      hapus.mutate(banner.id, {
                        onSuccess: () => toast.success("Banner dihapus."),
                        onError: (error) =>
                          toast.error(getErrorMessage(error, "Gagal menghapus banner.")),
                      })
                    }
                  >
                    <Trash2 className="mr-2 size-4" />
                    Hapus
                  </Button>
                )}
                <Button type="submit" disabled={simpan.isPending}>
                  {simpan.isPending
                    ? "Menyimpan..."
                    : baru
                      ? "Tambah Banner"
                      : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
