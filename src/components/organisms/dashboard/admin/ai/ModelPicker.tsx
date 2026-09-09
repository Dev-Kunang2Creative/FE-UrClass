"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AiModel } from "@/http/ai/admin-ai-settings";

/**
 * Pemilih model dari daftar yang dimuat dari provider.
 *
 * Menggantikan `<select>` bawaan browser. Bukan sekadar soal tampilan: gateway
 * bisa mengembalikan ratusan model, dan `<select>` bawaan tidak punya pencarian
 * di dalamnya - satu-satunya cara menemukan `moonshot/kimi-k3` di antara 300
 * pilihan adalah menggulir, atau menebak huruf pertamanya dan berharap.
 *
 * Pencariannya cocok ke id **dan** nama tampilan, karena keduanya dipakai orang
 * untuk mengingat model yang sama - ada yang mencari "kimi", ada yang mencari
 * "Moonshot".
 *
 * Teks bebas tetap bisa dipakai lewat baris terakhir. Daftar dari provider tidak
 * selalu lengkap: sebagian gateway menyembunyikan model tertentu dari
 * `/v1/models` tapi tetap melayaninya, dan alias seperti `auto` sering tidak
 * terdaftar sama sekali.
 *
 * Difilter sendiri, bukan lewat filter bawaan cmdk (`shouldFilter={false}`),
 * supaya baris teks bebas tidak ikut tersaring - teksnya memuat kata yang sedang
 * dicari, jadi ia bisa cocok atau tidak secara tak terduga.
 */

/**
 * Batas jumlah baris yang dirender sekaligus.
 *
 * Daftar dari gateway besar bisa melewati seribu model, dan merendernya semua
 * membuat popover-nya tersendat saat dibuka. Yang tidak terlihat tetap bisa
 * dicapai lewat pencarian - itu gunanya kolom di atas.
 */
const MAKS_TAMPIL = 80;

export default function ModelPicker({
  value,
  models,
  onChange,
}: {
  value: string;
  models: AiModel[];
  onChange: (model: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [cari, setCari] = useState("");

  const kunci = cari.trim().toLowerCase();

  const cocok = kunci
    ? models.filter(
        (item) =>
          item.id.toLowerCase().includes(kunci) ||
          (item.name ?? "").toLowerCase().includes(kunci),
      )
    : models;

  const tampil = cocok.slice(0, MAKS_TAMPIL);
  const tersembunyi = cocok.length - tampil.length;

  // Kalau yang diketik sudah persis salah satu id, baris teks bebas hanya
  // menduplikasi pilihan yang ada di atasnya.
  const sudahAda = models.some((item) => item.id.toLowerCase() === kunci);

  const pilih = (model: string) => {
    onChange(model);
    setOpen(false);
    setCari("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between font-normal"
        >
          <span className={value ? "truncate font-mono text-xs" : "truncate text-muted-foreground"}>
            {value || "— pilih model —"}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Cari di ${models.length} model...`}
            value={cari}
            onValueChange={setCari}
          />

          <CommandList>
            {tampil.length === 0 && !kunci && <CommandEmpty>Daftarnya kosong.</CommandEmpty>}

            {tampil.length > 0 && (
              <CommandGroup>
                {tampil.map((item) => (
                  <CommandItem key={item.id} value={item.id} onSelect={() => pilih(item.id)}>
                    <Check
                      className={`mr-2 size-4 shrink-0 ${
                        value === item.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-mono text-xs">{item.id}</span>
                      {item.name && item.name !== item.id && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.name}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {tersembunyi > 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                {tersembunyi} model lain tidak ditampilkan — persempit pencariannya.
              </p>
            )}

            {kunci && !sudahAda && (
              <CommandGroup heading="Tidak ada di daftar">
                <CommandItem value={`__bebas__${kunci}`} onSelect={() => pilih(cari.trim())}>
                  <PencilLine className="mr-2 size-4 shrink-0" />
                  <span className="truncate">
                    Pakai <span className="font-mono text-xs">{cari.trim()}</span> apa adanya
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
