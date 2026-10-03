"use client";

import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Target,
  PencilLine,
} from "lucide-react";
import Link from "next/link";
import type { TryoutHistoryData } from "@/http/tryout/get-history-tryout";
import { scoreSummary } from "@/lib/dashboard-tasks";
import { UBAH_TARGET_HREF } from "@/lib/profil";
import { useFormasiStatus } from "@/http/reference/get-instansi";

interface TrackStatisticsCardProps {
  histories?: TryoutHistoryData[];
  loading?: boolean;
}

export default function TrackStatisticsCard({
  histories = [],
  loading = false,
}: TrackStatisticsCardProps) {
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const { data: session } = useSession();
  const user = session?.user;
  // Selama admin menyembunyikan formasi, kartu target tidak menyebutnya juga -
  // "Atur di profil" akan menunjuk ke kolom yang tidak ada di sana.
  const formasiStatus = useFormasiStatus({
    token: session?.access_token ?? "",
    enabled: kategori === "cpns" && user?.cpns_target_type === "umum",
  });
  const formasiAktif = formasiStatus.data?.is_enabled ?? false;

  // Shared with ProgressAside so the average shown up in the sidebar and the
  // one shown here cannot drift apart.
  const { attempts: totalAttempted, average: avgScore, highest: highestScore } =
    scoreSummary(histories);

  if (kategori === "cpns") {
    // CPNS Specific Calculations
    // Passing grades: TWK 65 (max 150), TIU 80 (max 175), TKP 166 (max 225) - Total Max: 550
    const estimatedTWK = Math.min(150, Math.round(avgScore * (150 / 550)));
    const estimatedTIU = Math.min(175, Math.round(avgScore * (175 / 550)));
    const estimatedTKP = Math.min(225, Math.round(avgScore * (225 / 550)));

    const cpnsSubtests = [
      {
        name: "Tes Wawasan Kebangsaan (TWK)",
        code: "TWK",
        score: totalAttempted > 0 ? estimatedTWK : 0,
        pg: 65,
        max: 150,
        desc: "Nasionalisme, Integritas, Bela Negara, Pilar Negara",
      },
      {
        name: "Tes Inteligensi Umum (TIU)",
        code: "TIU",
        score: totalAttempted > 0 ? estimatedTIU : 0,
        pg: 80,
        max: 175,
        desc: "Kemampuan Verbal, Numerik, Logika & Figural",
      },
      {
        name: "Tes Karakteristik Pribadi (TKP)",
        code: "TKP",
        score: totalAttempted > 0 ? estimatedTKP : 0,
        pg: 166,
        max: 225,
        desc: "Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK",
      },
    ];

    const isAllPGPassed =
      totalAttempted > 0 &&
      cpnsSubtests.every((sub) => sub.score >= sub.pg);

    return (
      <div
        id="dashboard-stats-card"
        className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-[5px_5px_0px_0px_#0f172a] space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-950 border border-blue-300">
                <Award className="w-5 h-5 text-blue-900" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Statistik Evaluasi SKD CPNS
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Analisis capaian nilai terhadap standar Passing Grade KepmenPAN-RB resmi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl px-4 py-2 text-center">
              <span className="text-xs font-bold text-blue-950 uppercase block">
                Rata-rata Skor SKD
              </span>
              <span className="text-2xl font-black text-blue-950">
                {avgScore} <span className="text-xs font-semibold text-blue-900">/ 550</span>
              </span>
            </div>
          </div>
        </div>

        {/* Passing Grade Status Banner */}
        {totalAttempted > 0 ? (
          <div
            className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
              isAllPGPassed
                ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                : "bg-blue-50 border-blue-400 text-blue-950"
            }`}
          >
            {isAllPGPassed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <Sparkles className="w-6 h-6 text-blue-900 shrink-0" />
            )}
            <div className="text-sm">
              <span className="font-bold">
                {isAllPGPassed
                  ? "🎉 Luar Biasa! Rata-rata skormu telah melewati Passing Grade semua subtes."
                  : "💡 Fokuskan latihan pada subtes yang belum melampaui ambang batas Passing Grade (PG)."}
              </span>
              <p className="text-xs opacity-90 mt-0.5">
                Skor tertinggi kamu saat ini: <strong>{highestScore}</strong> dari total <strong>{totalAttempted}</strong> tryout yang diselesaikan.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-slate-800">
                Belum ada data tryout CPNS
              </span>
              <p className="text-xs text-slate-500">
                Selesaikan minimal 1 tryout CAT untuk melihat grafik kalkulasi passing grade TWK, TIU, dan TKP.
              </p>
            </div>
            <Link
              href="/dashboard/try-out"
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-[2px_2px_0px_0px_#0f172a] transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Mulai Tryout Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Target CPNS / Kedinasan Info Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KartuTarget className="bg-gradient-to-br from-blue-50/80 to-slate-50/60 rounded-2xl border-2 border-blue-200 p-4 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-900 text-white shadow-sm shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-950 block">
                {user?.cpns_target_type === "umum"
                  ? "Target Instansi Pilihan 1"
                  : "Target Sekolah Kedinasan 1"}
              </span>
              <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {(user?.cpns_target_type === "umum"
                  ? user?.target_instansi_1
                  : user?.target_university_1) || "Belum ditentukan"}
              </h4>
              <p className="text-xs text-slate-600 truncate">
                {user?.cpns_target_type === "umum"
                  ? formasiAktif
                    ? user?.target_formasi_1 || "Atur formasi di profil"
                    : "CPNS Umum"
                  : user?.target_major_1 || "Atur di profil"}
              </p>
            </div>
          </KartuTarget>

          <KartuTarget className="bg-gradient-to-br from-amber-50/80 to-yellow-50/60 rounded-2xl border-2 border-amber-200 p-4 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                {user?.cpns_target_type === "umum"
                  ? "Target Instansi Pilihan 2"
                  : "Target Sekolah Kedinasan 2"}
              </span>
              <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {(user?.cpns_target_type === "umum"
                  ? user?.target_instansi_2
                  : user?.target_university_2) || "Pilihan alternatif"}
              </h4>
              <p className="text-xs text-slate-600 truncate">
                {(user?.cpns_target_type === "umum"
                  ? user?.target_formasi_2
                  : user?.target_major_2) || "Atur di profil"}
              </p>
            </div>
          </KartuTarget>
        </div>

        {/* 3 Subtest Passing Grade Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {cpnsSubtests.map((sub) => {
            const isPassed = totalAttempted > 0 && sub.score >= sub.pg;
            const percentage = Math.min(100, Math.round((sub.score / sub.max) * 100));

            return (
              <div
                key={sub.code}
                className="bg-slate-50/80 rounded-2xl border-2 border-slate-200 p-4 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 shadow-sm">
                    {sub.code}
                  </span>
                  {totalAttempted > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isPassed
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {isPassed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Lolos PG
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Di Bawah PG
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {sub.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {sub.desc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Skor: <strong className="text-slate-900">{sub.score}</strong> / {sub.max}</span>
                    <span>Ambang Batas: <strong>{sub.pg}</strong></span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isPassed ? "bg-emerald-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // UTBK Specific Calculations
  const utbkSubtests = config.subtests;

  // If the user set a Kedinasan target in CPNS mode, don't show it as a PTN target in UTBK
  const isKedinasanTarget = user?.cpns_target_type === "kedinasan";
  const ptnTarget1 = !isKedinasanTarget ? user?.target_university_1 : null;
  const ptnMajor1 = !isKedinasanTarget ? user?.target_major_1 : null;
  const ptnTarget2 = !isKedinasanTarget ? user?.target_university_2 : null;
  const ptnMajor2 = !isKedinasanTarget ? user?.target_major_2 : null;

  return (
    <div
      id="dashboard-stats-card"
      className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-[5px_5px_0px_0px_#0f172a] space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-300">
              <GraduationCap className="w-5 h-5 text-blue-700" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Statistik Evaluasi UTBK - SNBT
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Analisis capaian materi TPS, Literasi, dan Penalaran Matematika berskala IRT.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl px-4 py-2 text-center">
            <span className="text-xs font-bold text-blue-800 uppercase block">
              Rata-rata Skor IRT
            </span>
            <span className="text-2xl font-black text-blue-900">
              {avgScore} <span className="text-xs font-semibold text-blue-700">/ 1000</span>
            </span>
          </div>
        </div>
      </div>

      {/* Target PTN Info Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KartuTarget className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-2xl border-2 border-blue-200 p-4 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
              Target Pilihan 1
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {ptnTarget1 || "Belum ditentukan"}
            </h4>
            <p className="text-xs text-slate-600 truncate">
              {ptnMajor1 || (isKedinasanTarget ? "Atur target PTN di profil" : "Atur jurusan di profil")}
            </p>
          </div>
        </KartuTarget>

        <KartuTarget className="bg-gradient-to-br from-sky-50/80 to-blue-50/60 rounded-2xl border-2 border-sky-200 p-4 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-700 text-white shadow-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
              Target Pilihan 2
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {ptnTarget2 || "Pilihan alternatif"}
            </h4>
            <p className="text-xs text-slate-600 truncate">
              {ptnMajor2 || (isKedinasanTarget ? "Atur target PTN di profil" : "Atur jurusan di profil")}
            </p>
          </div>
        </KartuTarget>
      </div>

      {/* Subtests Grid */}
      <div className="space-y-3 pt-1">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Cakupan Subtes UTBK SNBT</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {utbkSubtests.map((sub) => (
            <div
              key={sub.code}
              className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3.5 space-y-1.5 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {sub.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {sub.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {sub.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Kartu target yang bisa ditekan. Dulu hanya teks "Atur di profil", jadi
 * peserta harus mencari sendiri jalannya ke Pengaturan, membuka Edit Profil,
 * lalu menggulir sampai ketemu kolom target. Sekarang seluruh kartunya membawa
 * ke sana dan berhenti tepat di bagian target.
 */
function KartuTarget({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={UBAH_TARGET_HREF}
      className={`${className} group relative transition-all hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-[3px_3px_0px_0px_#0f172a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900`}
    >
      {children}
      <PencilLine
        className="size-4 shrink-0 self-center text-slate-400 transition-colors group-hover:text-slate-900"
        aria-hidden
      />
      <span className="sr-only">Ubah target di profil</span>
    </Link>
  );
}
