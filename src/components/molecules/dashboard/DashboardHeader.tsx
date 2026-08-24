"use client";

import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import Mascot from "@/components/atoms/mascot/Mascot";

interface DashboardHeaderProps {
  userName?: string;
}

function greeting(hour: number) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

/**
 * Replaces the full-bleed hero.
 *
 * The hero spent the most valuable space on the screen - a text-5xl headline
 * and up to p-10 of padding - on a greeting carrying no data, which on a phone
 * was most of the first screen. The track badge keeps the identity that hero
 * provided; everything below it is now something to act on.
 */
export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const Icon = config.icon;

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      {/* Small on purpose. This sits at the top of every dashboard visit, so it
          greets and then gets out of the way. */}
      <Mascot
        pose="hai"
        decorative
        sizes="48px"
        className="h-10 w-auto shrink-0"
      />
      <h1 className="min-w-0 flex-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
        {greeting(new Date().getHours())},{" "}
        <span className="text-primary">{userName || "Sobat UrClass"}</span>
      </h1>

      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-slate-900 bg-primary px-3 py-1 text-[11px] font-black uppercase tracking-wide text-primary-foreground">
        <Icon className="size-3.5" aria-hidden />
        {config.full}
      </span>
    </header>
  );
}
