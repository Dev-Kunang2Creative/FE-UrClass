"use client";

import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { BookOpenCheck, Landmark } from "lucide-react";

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
  const config = KATEGORI_CONFIG[kategori];
  const hour = new Date().getHours();

  if (kategori === "cpns") {
    return (
      <section
        id="hero-track-banner"
        className="relative overflow-hidden rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#0f172a]"
      >
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-950/40 text-amber-200 border border-amber-300/40 shadow-inner">
              <Landmark className="w-3.5 h-3.5 text-amber-300" />
              <span>JALUR CPNS &amp; KEDINASAN</span>
            </span>
            <span className="text-xs font-medium text-amber-100/80">
              • {greeting(hour)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Halo, {displayName}! Siap Tembus Passing Grade? 🏛️
          </h1>

          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed max-w-2xl">
            Ruang belajar aktif dalam <strong>Mode CPNS</strong>. Seluruh materi, simulasi tryout, dan analitik penilaian disesuaikan dengan standar Passing Grade CAT resmi (TWK, TIU, dan TKP).
          </p>
        </div>
      </section>
    );
  }

  // UTBK Track Banner
  return (
    <section
      id="hero-track-banner"
      className="relative overflow-hidden rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#0f172a]"
    >
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-950/40 text-blue-200 border border-blue-300/40 shadow-inner">
            <BookOpenCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span>JALUR UTBK - SNBT</span>
          </span>
          <span className="text-xs font-medium text-blue-100/80">
            • {greeting(hour)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
          Halo, {displayName}! Siap Taklukkan Kampus Impian? 🎓
        </h1>

        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
          Ruang belajar aktif dalam <strong>Mode UTBK</strong>. Seluruh materi, simulasi tryout bertimer, dan analitik penilaian berskala IRT disiapkan untuk memaksimalkan peluang lolos SNBT.
        </p>
      </div>
    </section>
  );
}
