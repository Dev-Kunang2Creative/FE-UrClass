"use client";

import KategoriSwitcher from "./KategoriSwitcher";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { useKategori } from "@/hooks/useKategori";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  userName?: string;
}

function greeting(hour: number) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default function HeroBanner({ userName }: HeroBannerProps) {
  const displayName = userName || "Sobat UrClass";
  const { kategori } = useKategori();
  const { full, tagline, theme } = KATEGORI_CONFIG[kategori];
  // Rendered client-side only, so local time is the user's own.
  const hour = new Date().getHours();

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-gray-500">{greeting(hour)},</p>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
          {displayName}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-bold",
              theme.accent,
            )}
          >
            {full}
          </span>
          <p className="text-sm text-gray-500 font-medium">{tagline}</p>
        </div>
      </div>

      <KategoriSwitcher />
    </section>
  );
}
