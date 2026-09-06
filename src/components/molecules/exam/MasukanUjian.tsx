"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  kategoriMasukan,
  kirimMasukan,
  type KategoriMasukan,
} from "@/http/tryout/masukan-ujian";
import { getErrorMessage } from "@/utils/get-error-message";
import { cn } from "@/lib/utils";

export default function MasukanUjian({
  tryoutId,
  token,
}: {
  tryoutId: string;
  token: string;
}) {
  const [rating, setRating] = useState(0);
  const [kategori, setKategori] = useState<KategoriMasukan>("kualitas_soal");
  const [komentar, setKomentar] = useState("");
  const [selesai, setSelesai] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState("");
  if (selesai) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bagaimana pengalaman tryoutmu?</CardTitle>
        <CardDescription>
          Beri penilaian dan masukan untuk membantu kami memperbaiki soal serta
          pengalaman ujian.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!rating) {
              setGalat("Pilih penilaian 1 sampai 5 bintang.");
              return;
            }
            setMengirim(true);
            setGalat("");
            try {
              await kirimMasukan(tryoutId, token, {
                rating,
                category: kategori,
                comment: komentar.trim(),
              });
              toast.success("Terima kasih, masukanmu sudah terkirim.");
              setSelesai(true);
            } catch (error) {
              setGalat(
                getErrorMessage(
                  error,
                  "Masukan gagal dikirim. Silakan coba lagi.",
                ),
              );
            } finally {
              setMengirim(false);
            }
          }}
        >
          <fieldset disabled={mengirim}>
            <legend className="mb-2 font-medium">Penilaian</legend>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((nilai) => (
                <label key={nilai} className="cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={nilai}
                    checked={rating === nilai}
                    onChange={() => setRating(nilai)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-md border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
                      rating >= nilai
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground",
                    )}
                  >
                    <Star
                      aria-hidden="true"
                      className="size-6"
                      fill={rating >= nilai ? "currentColor" : "none"}
                    />
                    <span className="sr-only">{nilai} bintang</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={mengirim}>
            <legend className="mb-2 font-medium">Kategori masukan</legend>
            <div className="flex flex-wrap gap-2">
              {kategoriMasukan.map(([value, label]) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="kategori-masukan"
                    value={value}
                    checked={kategori === value}
                    onChange={() => setKategori(value)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-11 items-center rounded-full border px-3 py-2 text-sm peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="komentar-ujian">
                Kritik atau saranmu
              </FieldLabel>
              <Textarea
                id="komentar-ujian"
                required
                maxLength={5000}
                value={komentar}
                onChange={(event) => setKomentar(event.target.value)}
                disabled={mengirim}
                placeholder="Ceritakan bagian yang perlu diperbaiki…"
              />
            </Field>
          </FieldGroup>
          {galat && (
            <p role="alert" className="text-sm text-destructive">
              {galat}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button disabled={mengirim || !token} type="submit">
              {mengirim ? "Mengirim…" : "Kirim Masukan"}
            </Button>
            <Button
              disabled={mengirim}
              type="button"
              variant="ghost"
              onClick={() => setSelesai(true)}
            >
              Lewati
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
