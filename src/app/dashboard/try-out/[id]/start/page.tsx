"use client";

import { useState, use, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useKategori } from "@/hooks/useKategori";
import { useStartTryout, type StartTryoutResponse } from "@/http/tryout/start-tryout";
import { useGetUserTryoutDetail } from "@/http/tryout/get-user-tryout-detail";
import { toast } from "sonner";
import type { SubtestByTryout } from "@/types/subtest/subtest";
import { getErrorMessage } from "@/utils/get-error-message";

interface TryoutSubtestSummary {
  name: string;
  questions: number;
  duration: number;
  category: string;
}

export default function TryoutStartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const { kategori } = useKategori();
  const isCpns = kategori === "cpns";

  const [isChecked, setIsChecked] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch tryout detail from API
  const { data: tryoutDetail, isLoading } = useGetUserTryoutDetail({
    id: tryoutId,
    token,
  });

  const tryout = tryoutDetail?.data;
  const tryoutTitle = tryout?.title || "Tryout";

  // Parse subtests from API
  const allSubtests: TryoutSubtestSummary[] = (tryout?.tryout_subtests || [])
    .sort((a: SubtestByTryout, b: SubtestByTryout) => a.order_no - b.order_no)
    .map((ts: SubtestByTryout) => {
      const rawName = ts.subtest.name;
      const displayName = rawName.includes("_") ? rawName.split("_").slice(1).join("_") : rawName;
      return {
        name: displayName,
        questions: ts.subtest.questions_count ?? ts.subtest.max_questions ?? 0,
        duration: ts.duration_minutes || 0,
        category: ts.subtest.category || (isCpns ? "SKD" : "TPS"),
      };
    });

  const totalQuestions = allSubtests.reduce((s, t) => s + t.questions, 0);
  const totalDuration = allSubtests.reduce((s, t) => s + t.duration, 0);

  const groupedSubtests = useMemo(() => {
    const groups: Record<string, TryoutSubtestSummary[]> = {};
    allSubtests.forEach((s) => {
      const cat = s.category || (isCpns ? "SKD" : "Umum");
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, [allSubtests, isCpns]);

  const startTryoutMutation = useStartTryout({
    token,
    options: {
      onSuccess: (data: StartTryoutResponse) => {
        const activeIndex = data.data.active_subtest_index ?? 0;
        router.push(`/dashboard/try-out/${tryoutId}/exam?subtest=${activeIndex}`);
      },
      onError: (error: unknown) => {
        const msg = getErrorMessage(error, "Gagal memulai tryout");
        toast.error(msg);
        setIsStarting(false);
      },
    },
  });

  const handleStartExam = async () => {
    setIsConfirmOpen(false);
    setIsStarting(true);
    startTryoutMutation.mutate(tryoutId);
  };

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

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500 pb-12 bg-white min-h-screen">
      {/* Top Navigation */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-100 mb-6">
        <Link href={`/dashboard/try-out/${tryoutId}`} className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Instruksi Tryout</h1>
      </div>

      <div className="px-6 md:px-10 space-y-8 max-w-4xl mx-auto">
        {/* Banner */}
        <div
          className={`rounded-xl p-6 text-center border ${
            isCpns
              ? "bg-orange-50 border-orange-200"
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <h2
            className={`text-xl font-bold mb-2 ${
              isCpns ? "text-orange-800" : "text-blue-600"
            }`}
          >
            Instruksi Pengerjaan Tryout {isCpns ? "CPNS" : "UTBK"}
          </h2>
          <p className="text-gray-700 text-sm">Baca instruksi berikut dengan seksama sebelum memulai tryout.</p>
        </div>

        {/* Title & Meta */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900">{tryoutTitle}</h3>
          <div
            className={`flex items-center justify-center gap-4 text-xs md:text-sm font-semibold ${
              isCpns ? "text-orange-800" : "text-blue-600"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <span>Total Waktu {totalDuration} menit</span>
            </div>
            <div className="w-[1px] h-3 bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500"><FileText className="w-3.5 h-3.5" /></span>
              <span>Total Soal {totalQuestions} soal</span>
            </div>
          </div>
        </div>

        {/* Subtests Box */}
        <div className="border border-gray-200 rounded-xl p-6 md:p-8 space-y-6">
          {Object.entries(groupedSubtests).map(([catName, list], idx) => {
            const groupDuration = list.reduce((s, t) => s + t.duration, 0);
            const groupQuestions = list.reduce((s, t) => s + t.questions, 0);

            return (
              <div key={catName} className="space-y-3">
                {idx > 0 && <hr className="border-gray-100 mb-6" />}
                <h4 className="font-bold text-gray-900 text-lg">
                  {catName === "TPS"
                    ? "Tes Potensi Skolastik (TPS)"
                    : catName === "Literasi"
                      ? "Tes Literasi"
                      : catName === "SKD"
                        ? "Seleksi Kompetensi Dasar (SKD)"
                        : catName}
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Jumlah Soal : {groupQuestions} Soal</p>
                  <p>Durasi : {groupDuration} menit</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-600 mb-2">Isi subtest :</p>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    {list.map((s) => (
                      <li key={s.name}>• {s.name} : {s.questions} soal ({s.duration} mnt)</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rules */}
        <div className="border border-gray-200 rounded-xl p-6 md:p-8 relative mt-12 pt-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4">
            <h4 className="font-bold text-gray-900 text-lg text-center">Aturan Pengerjaan</h4>
          </div>
          <ol className="list-decimal list-outside ml-4 text-sm text-gray-700 space-y-3 leading-relaxed">
            <li>Timer akan langsung berjalan ketika tryout dimulai.</li>
            <li>Setiap subtest memiliki batas waktu yang berbeda.</li>
            <li>Setelah menyelesaikan satu subtest, kamu akan melanjutkan ke subtest berikutnya.</li>
            <li>Pastikan semua soal telah dijawab sebelum menekan tombol Selesai Subtest.</li>
            <li>Jika masih ada soal yang belum dijawab, sistem akan memberikan peringatan.</li>
            <li>Pastikan koneksi internet stabil.</li>
            <li>Gunakan perangkat yang nyaman.</li>
            <li>Siapkan waktu yang cukup tanpa gangguan.</li>
          </ol>
        </div>

        {/* Checkbox & Start */}
        <div className="space-y-6 pt-4">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="mt-0.5">
              <input type="checkbox" className="hidden" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#1E3A8A] border-[#1E3A8A]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                {isChecked && (
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700 leading-relaxed pt-0.5">
              Saya sudah membaca dan memahami instruksi tryout. Tryout akan langsung dimulai setelah tombol ditekan dan timer akan berjalan.
            </span>
          </label>

          <button
            disabled={!isChecked || isStarting}
            onClick={() => setIsConfirmOpen(true)}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B9245] ${
              isChecked && !isStarting
                ? 'bg-[#3B9245] hover:bg-[#317A3A] text-white shadow-[0_4px_0_0_#2b6a32] active:shadow-none active:translate-y-1 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isStarting ? "Memulai..." : "Mulai Tryout"}
          </button>
        </div>
      </div>

      {/* Confirm Start Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md text-center p-8 rounded-2xl">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center mb-1">
              <span className="text-4xl">🚀</span>
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 mt-2">
              Siap Mulai Tryout?
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-4 px-2">
              Pastikan kamu sudah siap. Setelah dimulai, waktu pengerjaan akan langsung berjalan.
            </DialogDescription>
            <div className="flex w-full gap-3 pt-2">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 bg-[#F4F6F9] hover:bg-gray-200 text-[#8492A6] font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleStartExam}
                className="flex-1 bg-[#3B9245] hover:bg-[#317A3A] text-white font-semibold py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Mulai Try Out
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
