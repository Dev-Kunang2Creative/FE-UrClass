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
      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1"
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
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
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
