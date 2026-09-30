"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG, KATEGORI_LIST } from "@/lib/kategori";

export default function KategoriSwitcher() {
  const { kategori, switchKategori, isSwitching } = useKategori();

  return (
    <div
      role="group"
      aria-label="Ganti kategori belajar"
      className="flex w-full items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 sm:inline-flex sm:w-auto"
    >
      {KATEGORI_LIST.map((id) => {
        const { label, icon: Icon, deskripsi, theme } = KATEGORI_CONFIG[id];
        const active = id === kategori;

        return (
          <button
            key={id}
            type="button"
            onClick={() => switchKategori(id)}
            disabled={isSwitching}
            aria-pressed={active}
            title={deskripsi}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 sm:flex-none",
              active
                ? theme.switcherActive
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            {isSwitching && active ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Icon className="size-3.5" aria-hidden />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
