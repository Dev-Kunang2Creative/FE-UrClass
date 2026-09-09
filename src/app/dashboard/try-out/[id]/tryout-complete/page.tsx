"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useFinishTryout } from "@/http/tryout/finish-tryout";
import { useGetTryoutResult } from "@/http/tryout/get-tryout-result";
import { Calendar, FileText, Clock, Trophy } from "lucide-react";
import { formatJakartaDate } from "@/utils/date-time";
import Mascot from "@/components/atoms/mascot/Mascot";

export default function TryoutCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const [isSubmitted, setIsSubmitted] = useState(false);

  const finishTryoutMutation = useFinishTryout({
    token,
    options: {
      onSuccess: () => setIsSubmitted(true),
      onError: () => setIsSubmitted(true), // Still show success in case of error
    },
  });

  // Auto-submit tryout on mount
  useEffect(() => {
    if (!isSubmitted) {
      finishTryoutMutation.mutate(tryoutId);
    }
  }, []); // eslint-disable-line

  // Fetch result data after submission is complete
  const { data: resultData } = useGetTryoutResult({
    tryoutId,
    token,
    options: {
      enabled: isSubmitted,
    },
  });

  // Derived stats from result API
  const result = resultData?.data;
  const summary = resultData?.data?.summary;
  const scoreResult = resultData?.data?.score_result;
  const startedAt = resultData?.data?.started_at ? new Date(resultData.data.started_at) : null;
  const finishedAt = resultData?.data?.finished_at ? new Date(resultData.data.finished_at) : null;
  const isSimpleScoreReady = result?.use_irt === false && scoreResult?.is_ready;

  const totalQuestions = summary ? `${summary.answered} / ${summary.total_questions}` : "—";

  let elapsedTime = "—";
  if (startedAt && finishedAt) {
    const diffMs = finishedAt.getTime() - startedAt.getTime();
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      elapsedTime = `${diffMins}m ${diffSecs}s`;
    }
  }

  // Calculate release date
  let releaseDateStr = "Menunggu Proses...";
  const beReleaseDate = resultData?.data?.irt_result?.release_date;
  
  if (beReleaseDate) {
    const rd = new Date(beReleaseDate);
    releaseDateStr = `${formatJakartaDate(rd, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}, pukul ${String(rd.getHours()).padStart(2, "0")}:${String(rd.getMinutes()).padStart(2, "0")} WIB`;
  } else if (!resultData) {
    // Optimistic fallback before data loads
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 15);
    releaseDateStr = `${formatJakartaDate(releaseDate, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}, pukul 10:00 WIB`;
  }

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-500 py-8 px-4">
      {/* Success Banner */}
      <div className="mb-8 flex items-center gap-4 rounded-3xl border-2 border-slate-900 bg-primary p-6 text-primary-foreground shadow-[5px_5px_0px_0px_#0f172a]">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black tracking-tight md:text-2xl">
            Selamat, tryout kamu berhasil dikumpulkan!
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Terima kasih sudah mengerjakan sampai selesai. Satu langkah lagi
            lebih dekat ke targetmu.
          </p>
        </div>
        <Mascot
          pose="yay"
          decorative
          sizes="130px"
          className="h-28 w-auto shrink-0"
        />
      </div>

      {/* Result Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
        {/* Result Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 shrink-0 bg-track-tint rounded-xl flex items-center justify-center">
            {isSimpleScoreReady ? (
              <Trophy className="w-8 h-8 text-primary" />
            ) : (
              <Calendar className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Informasi Nilai</h3>
            {isSimpleScoreReady ? (
              <>
                <p className="text-sm text-gray-600 mt-1">
                  Try Out ini tidak menggunakan IRT. Skor Anda sudah tersedia.
                </p>
                <p className="text-primary font-bold text-2xl mt-2">
                  {scoreResult.final_score}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mt-1">
                  Nilai Try Out Anda sedang diproses. Hasil lengkap akan diumumkan pada:
                </p>
                <p className="text-primary font-bold text-base mt-2">
                  {releaseDateStr}
                </p>
              </>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-track-tint rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Soal Dikerjakan:</p>
              <p className="font-bold text-xl text-gray-900">{totalQuestions}</p>
            </div>
          </div>

          <div className="w-px h-12 bg-gray-200" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-track-tint rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Waktu Pengerjaan:</p>
              <p className="font-bold text-xl text-gray-900">{elapsedTime}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Action Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tidak lagi digantungkan pada skor IRT yang sudah final. Halaman
              hasil tetap berisi rincian per subtest, ringkasan benar/salah, dan
              jalan ke pembahasan - semuanya sudah ada sejak detik ini, dan
              menyembunyikannya membuat orang berhenti di layar ucapan selamat. */}
          <Link
            href={`/dashboard/try-out/${tryoutId}/result`}
            className="block w-full py-4 bg-[#3B9245] hover:bg-[#317A3A] text-white font-bold text-base rounded-xl text-center transition-colors shadow-[0_4px_0_0_#2b6a32] active:shadow-none active:translate-y-1"
          >
            Lihat Hasil Tryout
          </Link>
          <Link
            href="/dashboard"
            className="block w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl text-center transition-colors shadow-[0_4px_0_0_#0f172a] active:shadow-none active:translate-y-1"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
