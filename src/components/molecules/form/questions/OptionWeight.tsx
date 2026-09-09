"use client";

import { Scale } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OPTION_WEIGHT_MAX,
  OPTION_WEIGHT_MIN,
} from "@/validators/questions/question-validator";

/** Nilai enum scoring_scheme di backend untuk penilaian bobot per opsi. */
export const OPTION_WEIGHT_SCHEME = "option_weight";

const weights = Array.from(
  { length: OPTION_WEIGHT_MAX - OPTION_WEIGHT_MIN + 1 },
  (_, index) => OPTION_WEIGHT_MIN + index,
);

/**
 * Apa arti tiap angka, ditulis di sebelah kolomnya.
 *
 * Bobot TKP bukan turunan rumus apa pun: penulis soal yang memutuskan opsi mana
 * paling mendekati perilaku ideal. Tanpa keterangan ini kolomnya hanya terbaca
 * sebagai "angka 1 sampai 5" dan gampang diisi asal berbeda.
 */
export function OptionWeightHint() {
  return (
    <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
      <Scale className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-medium text-foreground">
          Subtes ini dinilai per bobot opsi, bukan benar/salah.
        </p>
        <p>
          Beri setiap opsi angka {OPTION_WEIGHT_MIN}-{OPTION_WEIGHT_MAX}, satu
          angka hanya sekali: {OPTION_WEIGHT_MAX} untuk respons paling ideal,{" "}
          {OPTION_WEIGHT_MIN} untuk yang paling jauh dari ideal. Tidak ada opsi
          bernilai 0 - peserta yang menjawab apa pun tetap mendapat nilai.
        </p>
      </div>
    </div>
  );
}

export function OptionWeightSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <Select
      value={value != null ? String(value) : undefined}
      onValueChange={(next) => onChange(Number(next))}
    >
      {/* w-full, karena trigger bawaannya w-fit + whitespace-nowrap: label
          sepanjang "5 - paling ideal" membuatnya melar melewati lebar kolomnya
          sendiri dan menabrak tombol hapus di sebelahnya. */}
      <SelectTrigger className="w-full min-w-0">
        <SelectValue placeholder="Bobot" />
      </SelectTrigger>

      <SelectContent>
        {weights.map((weight) => (
          <SelectItem key={weight} value={String(weight)}>
            {weight}
            {weight === OPTION_WEIGHT_MAX
              ? " - paling ideal"
              : weight === OPTION_WEIGHT_MIN
                ? " - paling jauh"
                : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
