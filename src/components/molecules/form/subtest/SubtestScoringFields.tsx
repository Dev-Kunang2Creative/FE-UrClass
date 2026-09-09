"use client";

import { useEffect } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  selectableSchemes,
  type SubtestType,
} from "@/validators/subtest/subtest-validator";

const schemeLabels: Record<
  (typeof selectableSchemes)[number],
  { label: string; hint: string }
> = {
  right_wrong: {
    label: "Benar / Salah",
    hint: "Satu opsi benar. Nilai benar, salah, dan kosong diatur di bawah. SKD memakai 5 untuk jawaban benar TWK/TIU.",
  },
  option_weight: {
    label: "Bobot per Opsi (TKP SKD)",
    hint: "Tidak ada kunci jawaban: setiap opsi soal diberi bobot 1-5, dan nilai benar/salah tidak dipakai.",
  },
};

/**
 * Konfigurasi penilaian satu subtes.
 *
 * Skemanya ditentukan jalur ujiannya, bukan dipilih bebas:
 *
 * - UTBK selalu IRT. Di skema itu tidak ada poin yang ditetapkan admin -
 *   jawaban dicatat benar atau salah, lalu bobot tiap soal dihitung dari hasil
 *   seluruh peserta. Karena itu tidak ada satu pun kolom nilai di sini, dan
 *   tidak ada yang perlu dipilih.
 * - CPNS memilih antara benar/salah dan bobot per opsi, karena SKD memang
 *   memakai keduanya sekaligus dalam satu tryout.
 *
 * Dipisah jadi komponen sendiri supaya form tambah dan form ubah subtes tidak
 * mungkin menawarkan aturan yang berbeda.
 */
export default function SubtestScoringFields({
  form,
}: {
  form: UseFormReturn<SubtestType>;
}) {
  const examType = form.watch("exam_type");
  const isUtbk = examType !== "cpns";
  const scheme = form.watch("scoring_scheme") ?? "right_wrong";

  // Nilai form disamakan dengan yang nanti disimpan server, supaya apa yang
  // dikirim tidak berbeda dari apa yang dibaca kembali setelah tersimpan.
  useEffect(() => {
    if (isUtbk && scheme !== "irt") {
      form.setValue("scoring_scheme", "irt");
    }
    if (!isUtbk && scheme === "irt") {
      form.setValue("scoring_scheme", "right_wrong");
    }
  }, [isUtbk, scheme, form]);

  if (isUtbk) {
    return (
      <Field>
        <FieldLabel>Skema Penilaian</FieldLabel>
        <div className="flex items-start gap-2.5 rounded-md border bg-muted/40 p-3 text-sm">
          <Scale className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              IRT — otomatis untuk jalur UTBK
            </p>
            <p className="text-muted-foreground">
              Jawaban dicatat benar atau salah, lalu bobot tiap soal dihitung
              dari hasil seluruh peserta. Tidak ada nilai benar, salah, atau
              kosong yang perlu diisi.
            </p>
          </div>
        </div>
      </Field>
    );
  }

  const weighted = scheme === "option_weight";

  return (
    <>
      <Controller
        control={form.control}
        name="scoring_scheme"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Skema Penilaian</FieldLabel>

            <Select
              onValueChange={field.onChange}
              value={
                field.value === "irt" ? "right_wrong" : field.value ?? "right_wrong"
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih skema penilaian" />
              </SelectTrigger>

              <SelectContent>
                {selectableSchemes.map((value) => (
                  <SelectItem key={value} value={value}>
                    {schemeLabels[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-sm text-muted-foreground">
              {schemeLabels[weighted ? "option_weight" : "right_wrong"].hint}
            </p>

            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Disembunyikan, bukan sekadar dinonaktifkan, pada skema bobot per opsi:
          angka yang terlihat tapi tidak dipakai lebih menyesatkan daripada
          tidak ada angka sama sekali. */}
      {!weighted && (
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["score_correct", "Nilai Jawaban Benar"],
              ["score_wrong", "Nilai Jawaban Salah"],
              ["score_empty", "Nilai Tidak Dijawab"],
            ] as const
          ).map(([name, label]) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{label}</FieldLabel>

                  <Input
                    type="number"
                    step="0.25"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        Number.isNaN(event.target.valueAsNumber)
                          ? undefined
                          : event.target.valueAsNumber,
                      )
                    }
                  />

                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}
