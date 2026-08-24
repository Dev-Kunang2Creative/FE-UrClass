"use client";

import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { BookOpenCheck, Landmark, Target } from "lucide-react";

interface HeroBannerProps {
  userName?: string;
}

function greeting(hour: number) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

/**
 * The two tracks differ in arrangement, not just palette.
 *
 * They used to share an identical structure - same section, badge, headline,
 * paragraph - with only the colours swapped, which is why the tracks felt like
 * the same screen twice.
 *
 * UTBK is aspirational: one large headline, generous space, no numbers. A SNBT
 * candidate has no threshold to clear, only a rank to climb.
 *
 * CPNS is operational: a compact bar plus the three passing grades, because
 * clearing TWK, TIU and TKP is the entire objective and any one of them failing
 * fails the whole SKD.
 */
export default function HeroBanner({ userName }: HeroBannerProps) {
  const displayName = userName || "Sobat UrClass";
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const hour = new Date().getHours();

  if (kategori === "cpns") {
    return (
      <section
        id="hero-track-banner"
        className="overflow-hidden rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a]"
      >
        <div className="flex flex-col gap-3 bg-gradient-to-r from-orange-800 to-orange-700 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange-950/40 ring-1 ring-orange-300/40">
              <Landmark className="size-4.5 text-orange-200" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-orange-200">
                Jalur CPNS &amp; Kedinasan
              </p>
              <h1 className="truncate text-lg font-black leading-tight sm:text-xl">
                {greeting(hour)}, {displayName}
              </h1>
            </div>
          </div>

          <p className="max-w-md text-[11px] leading-snug text-orange-100/90 sm:text-right">
            Penilaian mengikuti standar SKD CAT. Ketiga ambang di bawah wajib
            terlampaui — gagal satu berarti gagal seluruhnya.
          </p>
        </div>

        <div className="grid grid-cols-3 divide-x-2 divide-slate-900 border-t-2 border-slate-900 bg-white">
          {config.subtests.map((s) => (
            <div key={s.code} className="px-3 py-3 text-center sm:px-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-800/70">
                {s.code}
              </p>
              <p className="mt-0.5 text-xl font-black text-orange-900 sm:text-2xl">
                {s.passingGrade}
              </p>
              <p className="text-[10px] font-semibold text-orange-700/60">
                dari {s.maxScore}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero-track-banner"
      className="relative overflow-hidden rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-[6px_6px_0px_0px_#0f172a] sm:p-8 lg:p-10"
    >
      <div className="pointer-events-none absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute right-24 top-0 size-32 rounded-full bg-cyan-400/20 blur-xl" />

      <div className="relative z-10 flex max-w-3xl flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/40 bg-blue-950/40 px-3 py-1 text-xs font-black shadow-inner text-blue-200">
            <BookOpenCheck className="size-3.5 text-cyan-300" />
            <span>JALUR UTBK - SNBT</span>
          </span>
          <span className="text-xs font-medium text-blue-100/80">
            • {greeting(hour)}
          </span>
        </div>

        <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-5xl">
          Halo, {displayName}!
          <br className="hidden sm:block" /> Siap Taklukkan Kampus Impian? 🎓
        </h1>

        <p className="max-w-2xl text-xs leading-relaxed text-blue-100 sm:text-sm">
          Ruang belajar aktif dalam <strong>Mode UTBK</strong>. Materi, simulasi
          bertimer, dan analitik berskala IRT disiapkan untuk memaksimalkan
          peluang lolos SNBT.
        </p>

        <div className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
          <Target className="size-3.5 text-cyan-300" />
          <span>
            {config.subtests.length} subtest · {config.scoreScale}
          </span>
        </div>
      </div>
    </section>
  );
}
