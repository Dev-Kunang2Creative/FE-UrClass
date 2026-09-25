"use client";

import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { useGetTrackCards } from "@/http/track-cards/get-track-cards";
import {
  useResetTrackCard,
  useUpdateTrackCard,
} from "@/http/track-cards/update-track-card";
import { getErrorMessage } from "@/utils/get-error-message";
import type { TrackCard } from "@/types/track-card/track-card";
import { KATEGORI_CONFIG } from "@/lib/kategori";

/**
 * Penyunting teks kartu pemilihan jalur.
 *
 * Tidak ada tombol tambah atau hapus: kategorinya tetap dua, dan kartu yang
 * hilang berarti peserta tidak punya jalur untuk dipilih. Yang tersedia hanya
 * mengubah teksnya, dan mengembalikannya ke bawaan.
 */
export default function DashboardAdminTrackCardWrapper() {
  const { data: session } = useSession();
  const token = session?.access_token ?? "";
  const { data: kartu, isPending, isError, refetch } = useGetTrackCards();

  if (isPending) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-96 animate-pulse rounded-xl border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 py-10">
        <p role="alert" className="text-sm text-muted-foreground">
          Kartu jalur gagal dimuat.
        </p>
        <Button onClick={() => refetch()}>Coba lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(kartu ?? []).map((item) => (
        // key berisi isinya: setelah reset, form harus lahir membawa teks
        // bawaan alih-alih menyisakan yang lama di layar.
        <PenyuntingKartu
          key={`${item.kategori}-${item.title}-${item.badge}`}
          kartu={item}
          token={token}
        />
      ))}
    </div>
  );
}

function PenyuntingKartu({ kartu, token }: { kartu: TrackCard; token: string }) {
  const simpan = useUpdateTrackCard(token);
  const reset = useResetTrackCard(token);
  const config = KATEGORI_CONFIG[kartu.kategori];

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    simpan.mutate(
      {
        kategori: kartu.kategori,
        body: {
          title: String(data.get("title") ?? ""),
          badge: String(data.get("badge") ?? ""),
          cta: String(data.get("cta") ?? ""),
          description: String(data.get("description") ?? ""),
          features: [0, 1, 2]
            .map((i) => String(data.get(`feature-${i}`) ?? "").trim())
            .filter((poin) => poin !== ""),
        },
      },
      {
        onSuccess: () => toast.success(`Kartu ${config.label} tersimpan.`),
        onError: (error) =>
          toast.error(getErrorMessage(error, "Gagal menyimpan kartu jalur.")),
      },
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Kartu {config.label}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={reset.isPending}
              onClick={() =>
                reset.mutate(kartu.kategori, {
                  onSuccess: () =>
                    toast.success(`Kartu ${config.label} kembali ke teks bawaan.`),
                  onError: (error) =>
                    toast.error(getErrorMessage(error, "Gagal mengembalikan teks bawaan.")),
                })
              }
            >
              <RotateCcw className="mr-2 size-3.5" />
              Kembalikan bawaan
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`title-${kartu.kategori}`}>Judul</FieldLabel>
              <Input
                id={`title-${kartu.kategori}`}
                name="title"
                defaultValue={kartu.title}
                maxLength={80}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`badge-${kartu.kategori}`}>Label</FieldLabel>
              <Input
                id={`badge-${kartu.kategori}`}
                name="badge"
                defaultValue={kartu.badge}
                maxLength={40}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor={`description-${kartu.kategori}`}>
              Deskripsi
            </FieldLabel>
            <Textarea
              id={`description-${kartu.kategori}`}
              name="description"
              defaultValue={kartu.description}
              maxLength={300}
              rows={3}
            />
          </Field>

          <Field>
            <FieldLabel>Poin keunggulan</FieldLabel>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  name={`feature-${i}`}
                  defaultValue={kartu.features[i] ?? ""}
                  maxLength={80}
                  placeholder={`Poin ${i + 1}`}
                />
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor={`cta-${kartu.kategori}`}>Teks tombol</FieldLabel>
            <Input
              id={`cta-${kartu.kategori}`}
              name="cta"
              defaultValue={kartu.cta}
              maxLength={60}
            />
          </Field>

          <div className="flex justify-end">
            <Button type="submit" disabled={simpan.isPending}>
              {simpan.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
