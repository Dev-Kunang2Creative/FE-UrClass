"use client";

import { useEffect, useMemo } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OptionImageFieldProps {
  /** Label opsinya (A-E), untuk teks alternatif gambar. */
  optionKey: string;
  /** Berkas yang baru dipilih di form ini, belum terunggah. */
  file: File | null;
  /** Gambar yang sudah tersimpan di server, kalau soalnya sedang disunting. */
  imageUrl: string | null;
  /** Gambar tersimpan sedang ditandai untuk dilepas saat disimpan nanti. */
  deleted: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

/**
 * Kolom gambar untuk satu opsi jawaban.
 *
 * Dipakai form tambah dan form sunting soal. Keduanya perlu membedakan tiga
 * keadaan yang mudah tertukar: belum ada gambar, ada berkas baru yang belum
 * terunggah, dan ada gambar lama di server yang hendak dilepas. Yang terakhir
 * tidak cukup dinyatakan dengan mengosongkan kolom - backend mempertahankan
 * gambar lama selama tidak ada berkas pengganti, jadi pelepasannya butuh
 * penanda tersendiri.
 */
export default function OptionImageField({
  optionKey,
  file,
  imageUrl,
  deleted,
  onPick,
  onClear,
  disabled,
}: OptionImageFieldProps) {
  // useMemo, bukan state yang disemai dari effect: URL-nya turunan langsung
  // dari berkasnya, jadi tidak ada yang perlu disimpan terpisah.
  const previewBaru = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(
    () => () => {
      if (previewBaru) URL.revokeObjectURL(previewBaru);
    },
    [previewBaru],
  );

  const tampil = previewBaru ?? (deleted ? null : imageUrl);

  if (tampil) {
    return (
      <div className="relative w-fit">
        <img
          src={tampil}
          alt={`Gambar opsi ${optionKey}`}
          className="max-h-28 w-auto rounded-md border object-contain"
        />
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute right-1 top-1 h-7 w-7"
          onClick={onClear}
          disabled={disabled}
          aria-label={`Hapus gambar opsi ${optionKey}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
      <ImagePlus className="h-4 w-4" />
      <span>Tambah gambar opsi {optionKey}</span>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const berkas = e.target.files?.[0];
          if (berkas) onPick(berkas);
          // Dikosongkan supaya memilih berkas yang sama dua kali tetap memicu
          // onChange - kalau tidak, membatalkan lalu memilih ulang berkas yang
          // sama tidak melakukan apa pun.
          e.target.value = "";
        }}
      />
    </label>
  );
}
