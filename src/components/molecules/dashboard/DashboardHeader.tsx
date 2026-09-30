"use client";

import Mascot from "@/components/atoms/mascot/Mascot";
import KategoriSwitcher from "@/components/molecules/dashboard/KategoriSwitcher";

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
 * provided. The track switcher keeps that identity while making the current
 * choice actionable.
 */
export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      {/* Big enough to register. At h-10 it read as an icon and went
          unnoticed, which defeats the point of a greeting. */}
      <Mascot
        pose="hai"
        decorative
        sizes="80px"
        className="h-14 w-auto shrink-0 sm:h-16"
      />
      <h1 className="min-w-0 flex-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
        {greeting(new Date().getHours())},{" "}
        <span className="text-primary">{userName || "Sobat UrClass"}</span>
      </h1>

      <KategoriSwitcher />
    </header>
  );
}
