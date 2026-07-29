"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Trophy, Target, CheckCircle2, XCircle, MinusCircle, Clock, BarChart3 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetTryoutResult } from "@/http/tryout/get-tryout-result";
import { formatJakartaDate } from "@/utils/date-time";

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004AAB]" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-500">Data hasil tryout tidak tersedia.</p>
        <Link href={`/dashboard/try-out/${tryoutId}`} className="text-[#004AAB] font-semibold mt-4 inline-block">
          ← Kembali
        </Link>
      </div>
    );
  }

  const { summary, irt_result, use_irt, score_result } = result;
  const accuracy = Math.round(score_result?.accuracy ?? 0);

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/try-out/${tryoutId}`} className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Hasil Tryout</h1>
      </div>

      {/* Score Card — IRT atau Non-IRT */}
      {!use_irt ? (
        /* Non-IRT: tampilkan ringkasan benar/salah */
        <div className="bg-linear-to-br from-[#004AAB] to-[#002B66] rounded-2xl p-8 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-300" />
            <div>
              <h2 className="text-xl font-bold">{result.tryout_title}</h2>
              <p className="text-white/70 text-sm">Ringkasan Jawaban</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white/60 text-xs mb-1">Skor</p>
              <p className="text-3xl font-bold">{score_result.final_score}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white/60 text-xs mb-1">Akurasi</p>
              <p className="text-3xl font-bold">{accuracy}%</p>
            </div>
            <div className="bg-green-500/20 rounded-xl p-4 text-center">
              <p className="text-white/60 text-xs mb-1">Benar</p>
              <p className="text-3xl font-bold text-green-300">{summary.correct}</p>
            </div>
            <div className="bg-red-500/20 rounded-xl p-4 text-center">
              <p className="text-white/60 text-xs mb-1">Salah</p>
              <p className="text-3xl font-bold text-red-300">{summary.wrong}</p>
            </div>
          </div>
        </div>
      ) : irt_result?.is_ready ? (
        <div className="bg-linear-to-br from-[#004AAB] to-[#002B66] rounded-2xl p-8 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-300" />
            <div>
              <h2 className="text-xl font-bold">{result.tryout_title}</h2>
              <p className="text-white/70 text-sm">Hasil IRT Score</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 mt-6">
            {/* Score Circle */}
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#4CAF50"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(accuracy / 100) * 264} 264`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{irt_result.final_score}</span>
                <span className="text-xs text-white/60">IRT Score</span>
              </div>
            </div>

            {/* Score Details */}
            <div className="flex-1 grid grid-cols-3 gap-4 w-full">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">Akurasi</p>
                <p className="text-2xl font-bold">{accuracy}%</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">Peserta</p>
                <p className="text-2xl font-bold">{irt_result.total_participants_calculated}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">Final Score</p>
                <p className="text-2xl font-bold text-green-300">{irt_result.final_score}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center mb-6">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-amber-800">Hasil IRT Sedang Diproses</h2>
          <p className="text-amber-600 text-sm mt-2">
            Skor IRT akan tersedia setelah tryout berakhir dan cukup peserta menyelesaikan ujian.
            {irt_result?.release_date && (
              <span className="block mt-1">Perkiraan rilis: {formatJakartaDate(irt_result.release_date)}</span>
            )}
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <SummaryCard icon={<Target className="w-5 h-5 text-blue-500" />} label="Total Soal" value={summary.total_questions} bgColor="bg-blue-50" />
        <SummaryCard icon={<BarChart3 className="w-5 h-5 text-purple-500" />} label="Dijawab" value={summary.answered} bgColor="bg-purple-50" />
        <SummaryCard icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} label="Benar" value={summary.correct} bgColor="bg-green-50" />
        <SummaryCard icon={<XCircle className="w-5 h-5 text-red-500" />} label="Salah" value={summary.wrong} bgColor="bg-red-50" />
        <SummaryCard icon={<MinusCircle className="w-5 h-5 text-gray-400" />} label="Kosong" value={summary.unanswered} bgColor="bg-gray-50" />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/dashboard/try-out/${tryoutId}/review${attemptQuery}`}
          className="flex-1 py-3.5 bg-[#004AAB] hover:bg-[#003B8A] text-white font-bold rounded-xl text-center transition-colors"
        >
          Lihat Pembahasan
        </Link>
        <Link
          href={`/dashboard/try-out/${tryoutId}/leaderboard`}
          className="flex-1 py-3.5 bg-[#3B9245] hover:bg-[#317A3A] text-white font-bold rounded-xl text-center transition-colors"
        >
          Leaderboard
        </Link>
        <Link
          href="/dashboard/try-out"
          className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-center transition-colors"
        >
          Kembali ke Daftar Tryout
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, bgColor }: { icon: React.ReactNode; label: string; value: number; bgColor: string }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 text-center`}>
      <div className="mx-auto w-fit mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
