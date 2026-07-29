"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Clock, Ticket, Upload, X, Instagram, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTickets } from "@/hooks/useTickets";
import { useEnrollTryout } from "@/http/tryout/enroll-tryout";
import { useGetUserTryoutDetail } from "@/http/tryout/get-user-tryout-detail";
import { useGetHistoryTryout } from "@/http/tryout/get-history-tryout";
import { toast } from "sonner";
import type { SubtestByTryout } from "@/types/subtest/subtest";
import { getErrorMessage } from "@/utils/get-error-message";
import { getTryoutButtonState, TRYOUT_BUTTON_CLASS } from "@/utils/tryout-button-state";

interface TryoutSubtestSummary {
  name: string;
  questions: number;
  duration: number;
  category: string;
}

export default function TryoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const token = session?.access_token || "";
  const { ticketCount } = useTickets();

  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [proofPreviews, setProofPreviews] = useState<string[]>([]);

  const { data: tryoutDetail, isLoading } = useGetUserTryoutDetail({
    id: tryoutId,
    token,
  });

  // Fetch enrolled tryouts as a fallback for user-specific status.
  const { data: historyData, isLoading: historyLoading } = useGetHistoryTryout({ token });
  const tryout = tryoutDetail?.data;
  const enrolledTryout = historyData?.data?.find((t) => t.id === tryoutId);
  const isEnrolled = Boolean(tryout?.user_is_enrolled) || !!enrolledTryout;
  const attemptCount = Number(tryout?.user_attempt_count ?? enrolledTryout?.attemptCount ?? 0);
  const hasAttempted =
    attemptCount > 0 ||
    Boolean(enrolledTryout?.hasAttempted) ||
    (!!tryout?.user_session_status && tryout.user_session_status !== "not_started");
  const isFinished = tryout?.user_session_status === "finished" || enrolledTryout?.status === "selesai";
  const buttonState = getTryoutButtonState({ isEnrolled, hasAttempted });
  const buttonShadowClass = buttonState.variant === "yellow"
    ? "shadow-[0_4px_0_0_#a16207]"
    : "shadow-[0_4px_0_0_#2b6a32]";
  const tryoutTitle = tryout?.title || "";
  const isFree = tryout?.is_free ?? true;
  const tryoutType = isFree ? "Gratis" : "Premium";
  const tryoutCategory = tryout?.category || "-";

  // Parse subtests from API data
  const subtests: TryoutSubtestSummary[] = (tryout?.tryout_subtests || [])
    .sort((a: SubtestByTryout, b: SubtestByTryout) => a.order_no - b.order_no)
    .map((ts: SubtestByTryout) => {
      const rawName = ts.subtest.name;
      const displayName = rawName.includes("_") ? rawName.split("_").slice(1).join("_") : rawName;
      return {
        name: displayName,
        questions: ts.subtest.max_questions || 0,
        duration: ts.duration_minutes || 0,
        category: ts.subtest.category,
      };
    });

  // Calculate totals  
  const tpsSubtests = subtests.filter((s) => s.category === "TPS");
  const litSubtests = subtests.filter((s) => s.category === "Literasi");
  const totalQuestions = subtests.reduce((sum, s) => sum + s.questions, 0);
  const totalDuration = subtests.reduce((sum, s) => sum + s.duration, 0);
  const tpsQuestions = tpsSubtests.reduce((sum, s) => sum + s.questions, 0);
  const tpsDuration = tpsSubtests.reduce((sum, s) => sum + s.duration, 0);
  const litQuestions = litSubtests.reduce((sum, s) => sum + s.questions, 0);
  const litDuration = litSubtests.reduce((sum, s) => sum + s.duration, 0);

  // Enroll mutation
  const enrollMutation = useEnrollTryout({
    token,
    options: {
      onSuccess: () => {
        setShowEnrollDialog(false);
        setProofImages([]);
        setProofPreviews([]);
        toast.success(isFree ? "Berhasil mendaftar tryout!" : "Tiket berhasil digunakan! Kamu terdaftar untuk tryout ini.");
        updateSession();
        queryClient.invalidateQueries({ queryKey: ["get-user-tryouts"] });
        queryClient.invalidateQueries({ queryKey: ["get-user-tryout-detail", tryoutId] });
        queryClient.invalidateQueries({ queryKey: ["get-history-tryout"] });
        router.push(`/dashboard/try-out/${tryoutId}/start`);
      },
      onError: (error: unknown) => {
        const msg = getErrorMessage(error, "Gagal mendaftar tryout");
        toast.error(msg);
      },
    },
  });

  const handleEnroll = () => {
    enrollMutation.mutate({
      tryoutId,
      proofImages: isFree ? proofImages : undefined,
    });
  };

  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_FILE_SIZE_MB = 2;
  const MIN_PROOF_IMAGES = 2;
  const MAX_PROOF_IMAGES = 5;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const remainingSlots = MAX_PROOF_IMAGES - proofImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Maksimal upload ${MAX_PROOF_IMAGES} gambar.`);
      e.target.value = "";
      return;
    }

    const files = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      toast.warning(`Hanya ${remainingSlots} gambar yang ditambahkan. Maksimal ${MAX_PROOF_IMAGES} gambar.`);
    }

    const invalidType = files.find((file) => !ALLOWED_TYPES.includes(file.type));
    if (invalidType) {
      toast.error("Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.");
      e.target.value = "";
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversizedFile) {
      toast.error(`Ukuran gambar melebihi batas ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setProofImages((current) => [...current, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreviews((current) => [...current, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeProofImage = (index: number) => {
    setProofImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setProofPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  if (sessionStatus === "loading" || isLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004AAB]" />
      </div>
    );
  }

  if (!tryout) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-500">Tryout tidak ditemukan.</p>
        <Link href="/dashboard/try-out" className="text-[#004AAB] font-semibold mt-4 inline-block">
          ← Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500 pb-12 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-100 mb-6">
        <Link href="/dashboard/try-out" className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Detail Try Out</h1>
      </div>

      <div className="px-6 md:px-10 space-y-6 max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="flex justify-center gap-2">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-[#004AAB]">
              {tryoutCategory}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${isFree ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {tryoutType}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{tryoutTitle}</h2>

          <div className="flex items-center justify-center gap-4 text-sm text-[#004AAB] font-semibold">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Total Waktu {totalDuration} menit</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Total Soal {totalQuestions} soal</span>
            </div>
          </div>
        </div>

        {/* Subtests Info */}
        <div className="border border-gray-200 rounded-xl p-6 md:p-8 space-y-8">
          {/* TPS */}
          {tpsSubtests.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 text-lg">Tes Potensi Skolastik (TPS)</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Jumlah Soal : {tpsQuestions} Soal</p>
                <p>Durasi : {tpsDuration} menit</p>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-2">Isi subtest :</p>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  {tpsSubtests.map((s) => (
                    <li key={s.name}>• {s.name} : {s.questions} soal</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tpsSubtests.length > 0 && litSubtests.length > 0 && <hr className="border-gray-100" />}

          {/* Literasi */}
          {litSubtests.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 text-lg">Tes Literasi</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Jumlah Soal : {litQuestions} Soal</p>
                <p>Durasi : {litDuration} menit</p>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-2">Isi subtest :</p>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  {litSubtests.map((s) => (
                    <li key={s.name}>• {s.name} : {s.questions} soal</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {isEnrolled ? (
            buttonState.action === "retry_tryout" && isFinished ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => router.push(`/dashboard/try-out/${tryoutId}/start`)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm ${buttonShadowClass} active:shadow-none active:translate-y-1 transition-all ${TRYOUT_BUTTON_CLASS[buttonState.variant]}`}
                >
                  {buttonState.label}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/try-out/${tryoutId}/result`)}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#004AAB] hover:bg-[#003B8A] text-white shadow-[0_4px_0_0_#002B66] active:shadow-none active:translate-y-1 transition-all"
                >
                  Lihat Hasil Skor & Pembahasan
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push(`/dashboard/try-out/${tryoutId}/start`)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm ${buttonShadowClass} active:shadow-none active:translate-y-1 transition-all ${TRYOUT_BUTTON_CLASS[buttonState.variant]}`}
              >
                {buttonState.label}
              </button>
            )
          ) : (
            <button 
              onClick={() => setShowEnrollDialog(true)}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#004AAB] hover:bg-[#003B8A] text-white shadow-[0_4px_0_0_#002B66] active:shadow-none active:translate-y-1 transition-all"
            >
              {isFree ? "Daftar Tryout (Gratis)" : `Daftar Tryout (1 Tiket)`}
            </button>
          )}
        </div>
      </div>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-md p-0 rounded-2xl overflow-hidden">
          <div className="bg-[#004AAB] p-6 text-white text-center">
            <DialogTitle className="text-xl font-bold text-white">
              {isFree ? "Daftar Tryout Gratis" : "Gunakan Tiket"}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm mt-1">
              {isFree
                ? "Upload bukti follow Instagram untuk mendaftar"
                : `Kamu akan menggunakan 1 tiket. Sisa tiket: ${ticketCount}`
              }
            </DialogDescription>
          </div>

          <div className="p-6 space-y-5">
            {isFree ? (
              <>
                <div>
                  <label className="font-semibold text-gray-800 text-sm mb-2 block">Bukti Follow Instagram</label>
                  <p className="text-xs text-gray-500 mb-3">
                    Follow kedua akun Instagram berikut, lalu upload minimal 2 foto bukti follow.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <a
                      href="https://www.instagram.com/fdlyshdq/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-100 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      @fdlyshdq
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://www.instagram.com/basykailakh/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-100 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      @basykailakh
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {proofPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {proofPreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative rounded-xl overflow-hidden border-2 border-green-400">
                          <img src={preview} alt={`Preview bukti follow ${index + 1}`} className="w-full h-32 object-cover" />
                          <button
                            type="button"
                            onClick={() => removeProofImage(index)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            aria-label={`Hapus bukti follow ${index + 1}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {proofImages.length < MAX_PROOF_IMAGES && (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#004AAB] transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Klik untuk upload bukti follow</span>
                      <span className="text-xs text-gray-400 mt-1 text-center px-4">
                        Minimal 2 foto bukti follow, maksimal {MAX_PROOF_IMAGES} foto
                      </span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, maks 2MB per foto</span>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <Ticket className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">1 Tiket akan digunakan</p>
                  <p className="text-xs text-gray-500">Sisa tiket kamu: <strong>{ticketCount}</strong></p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowEnrollDialog(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEnroll}
                disabled={
                  enrollMutation.isPending || 
                  (isFree && proofImages.length < MIN_PROOF_IMAGES) || 
                  (!isFree && (ticketCount || 0) < 1)
                }
                className="flex-1 bg-[#004AAB] hover:bg-[#003B8A] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {enrollMutation.isPending 
                  ? "Memproses..." 
                  : isFree 
                    ? "Daftar Sekarang" 
                    : (!isFree && (ticketCount || 0) < 1)
                      ? "Tiket Tidak Cukup"
                      : "Gunakan Tiket"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
