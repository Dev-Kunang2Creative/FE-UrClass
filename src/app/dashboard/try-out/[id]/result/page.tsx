"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  BarChart3,
  Calendar,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useKategori } from "@/hooks/useKategori";
import { useGetTryoutResult } from "@/http/tryout/get-tryout-result";
import { formatJakartaDate } from "@/utils/date-time";
import SubtestBreakdown from "@/components/molecules/exam/SubtestBreakdown";

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);
  const searchParams = useSearchParams();
  const attempt = Number(searchParams.get("attempt") || 0) || undefined;
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const { kategori } = useKategori();
  const isCpns = kategori === "cpns";

  const { data: beResult, isLoading } = useGetTryoutResult({
    tryoutId,
    token,
    attempt,
  });

  const result = beResult?.data;
  const attemptQuery = attempt ? `?attempt=${attempt}` : "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className={`animate-spin rounded-full h-10 w-10 border-b-2 ${
            isCpns ? "border-orange-700" : "border-blue-600"
          }`}
        />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-500 font-semibold">Data hasil tryout tidak tersedia.</p>
        <Link
          href={`/dashboard/try-out/${tryoutId}`}
          className="font-bold mt-4 inline-flex items-center gap-1 text-primary hover:underline"
        >
          ← Kembali ke Detail Tryout
        </Link>
      </div>
    );
  }

  const { summary, irt_result, use_irt, score_result, per_subtest } = result;
  const accuracy = Math.round(score_result?.accuracy ?? 0);

  const heroCardClass = isCpns
    ? "bg-linear-to-br from-orange-700 via-orange-800 to-slate-900 border-2 border-slate-900 text-white"
    : "bg-linear-to-br from-blue-600 via-blue-700 to-slate-900 border-2 border-slate-900 text-white";

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/try-out/${tryoutId}`}
          className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
          Hasil Tryout
        </h1>
      </div>

      {/* Score Card — IRT atau Non-IRT */}
      {!use_irt ? (
        /* Non-IRT: tampilkan ringkasan benar/salah */
        <div className={`${heroCardClass} rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#0f172a]`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 text-yellow-300 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{result.tryout_title}</h2>
              <p className="text-white/80 text-xs sm:text-sm font-medium">Ringkasan Jawaban</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white/10 border-2 border-white/15 rounded-2xl p-4 text-center backdrop-blur-xs">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Skor</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{score_result.final_score}</p>
            </div>
            <div className="bg-white/10 border-2 border-white/15 rounded-2xl p-4 text-center backdrop-blur-xs">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Akurasi</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{accuracy}%</p>
            </div>
            <div className="bg-emerald-500/20 border-2 border-emerald-400/30 rounded-2xl p-4 text-center backdrop-blur-xs">
              <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">Benar</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-300">{summary.correct}</p>
            </div>
            <div className="bg-rose-500/20 border-2 border-rose-400/30 rounded-2xl p-4 text-center backdrop-blur-xs">
              <p className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">Salah</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-300">{summary.wrong}</p>
            </div>
          </div>
        </div>
      ) : irt_result?.is_ready ? (
        <div className={`${heroCardClass} rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#0f172a]`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 text-yellow-300 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{result.tryout_title}</h2>
              <p className="text-white/80 text-xs sm:text-sm font-medium">Hasil Penilaian IRT</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 mt-6">
            {/* Score Circle */}
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#34d399"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(accuracy / 100) * 264} 264`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{irt_result.final_score}</span>
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">IRT Score</span>
              </div>
            </div>

            {/* Score Details */}
            <div className="flex-1 grid grid-cols-3 gap-3 w-full">
              <div className="bg-white/10 border-2 border-white/15 rounded-2xl p-4 text-center">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Akurasi</p>
                <p className="text-xl sm:text-2xl font-black text-white">{accuracy}%</p>
              </div>
              <div className="bg-white/10 border-2 border-white/15 rounded-2xl p-4 text-center">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Peserta</p>
                <p className="text-xl sm:text-2xl font-black text-white">{irt_result.total_participants_calculated}</p>
              </div>
              <div className="bg-emerald-500/20 border-2 border-emerald-400/30 rounded-2xl p-4 text-center">
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">Final Score</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-300">{irt_result.final_score}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-slate-900 bg-amber-50/90 p-6 sm:p-8 text-center shadow-[5px_5px_0px_0px_#0f172a]">
          <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-900 bg-amber-400 text-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
            <Clock className="h-7 w-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Hasil IRT Sedang Diproses</h2>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
            Skor masih bisa berubah sampai skor IRT tersedia setelah tryout berakhir dan cukup peserta menyelesaikan ujian.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Perkiraan rilis:</span>
            <span className="text-primary font-black">
              {irt_result?.release_date ? formatJakartaDate(irt_result.release_date) : "7/9/2026"}
            </span>
          </div>
        </div>
      )}

      {/* Placed above the aggregate summary on purpose: for CPNS the per-
          threshold verdict is the result, and totals are context. */}
      <SubtestBreakdown perSubtest={per_subtest} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <SummaryCard
          icon={<Target className={`w-5 h-5 ${isCpns ? "text-orange-600" : "text-blue-600"}`} />}
          label="Total Soal"
          value={summary.total_questions}
          iconBg={isCpns ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-blue-100 text-blue-700 border-blue-200"}
        />
        <SummaryCard
          icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
          label="Dijawab"
          value={summary.answered}
          iconBg="bg-purple-100 text-purple-700 border-purple-200"
        />
        <SummaryCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          label="Benar"
          value={summary.correct}
          iconBg="bg-emerald-100 text-emerald-700 border-emerald-200"
        />
        <SummaryCard
          icon={<XCircle className="w-5 h-5 text-rose-600" />}
          label="Salah"
          value={summary.wrong}
          iconBg="bg-rose-100 text-rose-700 border-rose-200"
        />
        <SummaryCard
          icon={<MinusCircle className="w-5 h-5 text-slate-500" />}
          label="Kosong"
          value={summary.unanswered}
          iconBg="bg-slate-100 text-slate-600 border-slate-200"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href={`/dashboard/try-out/${tryoutId}/review${attemptQuery}`}
          className="flex-1 py-3.5 bg-primary hover:brightness-95 text-primary-foreground font-bold rounded-xl text-center border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] active:translate-y-0.5 active:shadow-none transition-all"
        >
          Lihat Pembahasan
        </Link>
        <Link
          href={`/dashboard/try-out/${tryoutId}/leaderboard`}
          className="flex-1 py-3.5 bg-[#3B9245] hover:bg-[#327851] text-white font-bold rounded-xl text-center border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] active:translate-y-0.5 active:shadow-none transition-all"
        >
          Leaderboard
        </Link>
        <Link
          href="/dashboard/try-out"
          className="flex-1 py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl text-center border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] active:translate-y-0.5 active:shadow-none transition-all"
        >
          Kembali ke Daftar Tryout
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white p-4 text-center shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-y-0.5 transition-all">
      <div className={`mx-auto w-10 h-10 flex items-center justify-center rounded-xl border ${iconBg} mb-2.5 shadow-2xs`}>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">{label}</p>
    </div>
  );
}
