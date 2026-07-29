"use client";

import { Suspense, use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, FileText, PartyPopper } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetUserTryoutDetail } from "@/http/tryout/get-user-tryout-detail";
import type { SubtestByTryout } from "@/types/subtest/subtest";

function SubtestCompleteContent({ tryoutId }: { tryoutId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const currentIdx = parseInt(searchParams.get("current") || "0", 10);
  const nextIdx = parseInt(searchParams.get("next") || "1", 10);

  const { data: tryoutDetail, isLoading } = useGetUserTryoutDetail({
    id: tryoutId,
    token,
  });

  const subtests = useMemo(() => {
    return [...(tryoutDetail?.data?.tryout_subtests || [])]
      .sort((a: SubtestByTryout, b: SubtestByTryout) => a.order_no - b.order_no)
      .map((ts: SubtestByTryout) => ({
        id: ts.id,
        name: ts.subtest.name.includes("_") ? ts.subtest.name.split("_").slice(1).join("_") : ts.subtest.name,
        duration: ts.duration_minutes || 0,
        questions: ts.subtest.questions_count ?? ts.subtest.max_questions ?? 0,
      }));
  }, [tryoutDetail]);

  const totalSubtests = parseInt(searchParams.get("total") || String(subtests.length), 10);
  const completedSubtest = subtests[currentIdx];
  const nextSubtest = nextIdx < subtests.length ? subtests[nextIdx] : null;
  const isLastSubtest = nextIdx >= totalSubtests;

  const handleStartNext = () => {
    router.push(`/dashboard/try-out/${tryoutId}/exam?subtest=${nextIdx}`);
  };

  const handleFinishTryout = () => {
    router.push(`/dashboard/try-out/${tryoutId}/tryout-complete`);
  };

  if (isLoading || !completedSubtest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004AAB]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-500 py-12 px-4">
      <div className="bg-gradient-to-r from-[#3B9245] to-[#4CAF50] rounded-2xl p-8 text-center text-white mb-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Subtest {completedSubtest.name} Selesai
        </h1>
        <p className="text-white/80 text-sm">
          {isLastSubtest
            ? "Semua subtest telah selesai dikerjakan."
            : "Selanjutnya kamu akan mengerjakan subtest berikutnya."}
        </p>
      </div>

      {!isLastSubtest && nextSubtest ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
          <h2 className="text-xl font-bold text-[#004AAB]">{nextSubtest.name}</h2>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Jumlah Soal : <strong>{nextSubtest.questions} Soal</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Waktu : <strong>{nextSubtest.duration} menit</strong></span>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Subtest {nextIdx + 1} dari {totalSubtests}
          </div>

          <button
            onClick={handleStartNext}
            className="w-full py-4 bg-[#004AAB] hover:bg-[#003B8A] text-white font-bold text-base rounded-xl transition-colors shadow-[0_4px_0_0_#002B66] active:shadow-none active:translate-y-1"
          >
            Mulai Subtest Berikutnya
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <PartyPopper className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Semua Subtest Selesai!</h2>
          <p className="text-gray-600 text-sm">
            Kamu telah menyelesaikan seluruh subtest. Submit dan lihat hasilnya sekarang!
          </p>
          <button
            onClick={handleFinishTryout}
            className="w-full py-4 bg-[#3B9245] hover:bg-[#317A3A] text-white font-bold text-base rounded-xl transition-colors"
          >
            Submit & Akhiri Try Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function SubtestCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004AAB]" /></div>}>
      <SubtestCompleteContent tryoutId={tryoutId} />
    </Suspense>
  );
}
