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
} from "lucide-react";
import Link from "next/link";
import type { TryoutHistoryData } from "@/http/tryout/get-history-tryout";

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

  // Filter histories with valid finished scores
  const finishedHistories = histories.filter(
    (h) => h.status === "selesai" && Number(h.score) > 0,
  );

  const totalAttempted = finishedHistories.length;
  const avgScore =
    totalAttempted > 0
      ? Math.round(
          finishedHistories.reduce((acc, curr) => acc + Number(curr.score), 0) /
            totalAttempted,
        )
      : 0;

  const highestScore =
    totalAttempted > 0
      ? Math.max(...finishedHistories.map((h) => Number(h.score)))
      : 0;

  if (kategori === "cpns") {
    // CPNS Specific Calculations
    // Passing grades: TWK 65 (max 150), TIU 80 (max 175), TKP 166 (max 225)
    const estimatedTWK = Math.min(150, Math.round(avgScore * 0.26));
    const estimatedTIU = Math.min(175, Math.round(avgScore * 0.32));
    const estimatedTKP = Math.min(225, Math.round(avgScore * 0.42));

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
              <span className="p-1.5 rounded-lg bg-orange-100 text-orange-800 border border-orange-300">
                <Award className="w-5 h-5 text-orange-700" />
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
            <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl px-4 py-2 text-center">
              <span className="text-xs font-bold text-orange-800 uppercase block">
                Rata-rata Skor SKD
              </span>
              <span className="text-2xl font-black text-orange-900">
                {avgScore} <span className="text-xs font-semibold text-orange-700">/ 550</span>
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
                : "bg-orange-50 border-orange-400 text-orange-900"
            }`}
          >
            {isAllPGPassed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <Sparkles className="w-6 h-6 text-orange-600 shrink-0" />
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
          <div className="p-4 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
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
              className="px-4 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs shadow-[2px_2px_0px_0px_#0f172a] transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Mulai Tryout Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

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
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-2xl border-2 border-blue-200 p-4 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
              Target Pilihan 1
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {user?.target_university_1 || "Belum ditentukan"}
            </h4>
            <p className="text-xs text-slate-600 truncate">
              {user?.target_major_1 || "Atur jurusan di profil"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/60 rounded-2xl border-2 border-indigo-200 p-4 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
              Target Pilihan 2
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {user?.target_university_2 || "Pilihan alternatif"}
            </h4>
            <p className="text-xs text-slate-600 truncate">
              {user?.target_major_2 || "Atur jurusan di profil"}
            </p>
          </div>
        </div>
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
