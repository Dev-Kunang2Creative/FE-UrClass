"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, FileText, Clock, Ticket, Upload, X, Instagram, ExternalLink, Calendar, Users, Radio, ListChecks, Gauge, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTickets } from "@/hooks/useTickets";
import { useEnrollTryout } from "@/http/tryout/enroll-tryout";
import {
  useGetUserTryoutDetail,
  wrongTrackFrom,
} from "@/http/tryout/get-user-tryout-detail";
import { useGetHistoryTryout } from "@/http/tryout/get-history-tryout";
import { toast } from "sonner";
import type { SubtestByTryout } from "@/types/subtest/subtest";
import { getErrorMessage } from "@/utils/get-error-message";
import { getTryoutButtonState, TRYOUT_BUTTON_CLASS } from "@/utils/tryout-button-state";
import { useKategori } from "@/hooks/useKategori";
import { useSchedule } from "@/hooks/useSchedule";
import Mascot from "@/components/atoms/mascot/Mascot";
import { PENDING_PILL, PHASE_PILL } from "@/lib/tryout-schedule";
import { KATEGORI_CONFIG, type Kategori } from "@/lib/kategori";

/**
 * Headings for the subtest groups, per track.
 *
 * subtests.category is an enum of only TPS|Literasi, so the three SKD
 * subtests are stored as "TPS" - which meant a CPNS candidate was shown
 * "Tes Potensi Skolastik (TPS)", a UTBK term, above their TWK/TIU/TKP.
 * Widening the enum is the real fix, but the exam flow branches on
 * category === "TPS", so the correction belongs here for now.
 */
const GROUP_LABEL: Record<Kategori, Partial<Record<string, string>>> = {
  utbk: { TPS: "Tes Potensi Skolastik (TPS)", Literasi: "Tes Literasi" },
  cpns: { TPS: "Seleksi Kompetensi Dasar (SKD)" },
};

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
  const { kategori, switchKategori, isSwitching } = useKategori();
  const trackConfig = KATEGORI_CONFIG[kategori];
  const TrackIcon = trackConfig.icon;

  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [proofPreviews, setProofPreviews] = useState<string[]>([]);

  const {
    data: tryoutDetail,
    isLoading,
    error: detailError,
  } = useGetUserTryoutDetail({
    id: tryoutId,
    token,
  });

  // Fetch enrolled tryouts as a fallback for user-specific status.
  const { data: historyData, isLoading: historyLoading } = useGetHistoryTryout({ token });
  const tryout = tryoutDetail?.data;
  const schedule = useSchedule(
    tryout?.start_date ? String(tryout.start_date) : null,
    tryout?.end_date ? String(tryout.end_date) : null,
  );
  const enrolledTryout = historyData?.data?.find((t) => t.id === tryoutId);
  const isEnrolled = Boolean(tryout?.user_is_enrolled) || !!enrolledTryout;
  const attemptCount = Number(tryout?.user_attempt_count ?? enrolledTryout?.attemptCount ?? 0);
  const hasAttempted =
    attemptCount > 0 ||
    Boolean(enrolledTryout?.hasAttempted) ||
    (!!tryout?.user_session_status && tryout.user_session_status !== "not_started");
  const isFinished = tryout?.user_session_status === "finished" || enrolledTryout?.status === "selesai";
  // sessionStatus was available here all along and never passed, so an
  // unfinished attempt was labelled "Kerjakan Ulang" - a restart - on the one
  // screen someone lands on when they come back to finish.
  const buttonState = getTryoutButtonState({
    isEnrolled,
    hasAttempted,
    sessionStatus: tryout?.user_session_status,
  });
  // One shadow for both variants. The old pair hardcoded yellow-700 and a
  // green, matching variant names that no longer exist and neither track.
  const buttonShadowClass = "shadow-[0_4px_0_0_#0f172a]";
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

  const totalQuestions = subtests.reduce((sum, s) => sum + s.questions, 0);
  const totalDuration = subtests.reduce((sum, s) => sum + s.duration, 0);

  // Derived from the data rather than two hardcoded UTBK buckets, so a track
  // with one group renders one group and a new category still shows up.
  const groups = Array.from(new Set(subtests.map((s) => s.category))).map(
    (category) => {
      const items = subtests.filter((s) => s.category === category);
      return {
        category,
        label: GROUP_LABEL[kategori][category] ?? category,
        items,
        questions: items.reduce((sum, s) => sum + s.questions, 0),
        duration: items.reduce((sum, s) => sum + s.duration, 0),
      };
    },
  );

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!tryout) {
    // A tryout on the other jalur is not a missing tryout. The endpoint says
    // which track it belongs to, so the reader is offered the switch instead of
    // being told the thing does not exist.
    const wrongTrack = wrongTrackFrom(detailError);
    const otherTrack = wrongTrack?.kategori;

    return (
      <div className="mx-auto w-full max-w-lg py-12">
        <div className="rounded-3xl border-2 border-slate-900 bg-white p-6 text-center shadow-[5px_5px_0px_0px_#0f172a]">
          {otherTrack ? (
            <>
              <p className="text-base font-black tracking-tight text-slate-900">
                Tryout ini ada di jalur {KATEGORI_CONFIG[otherTrack].label}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Kamu sedang di jalur {trackConfig.label}. Ganti jalur untuk
                membuka tryout ini.
              </p>
              <button
                type="button"
                onClick={() => switchKategori(otherTrack)}
                disabled={isSwitching}
                className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-95 active:translate-y-0.5 disabled:opacity-60"
              >
                {isSwitching
                  ? "Mengganti jalur..."
                  : `Pindah ke jalur ${KATEGORI_CONFIG[otherTrack].label}`}
              </button>
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-700">
              Tryout tidak ditemukan.
            </p>
          )}

          <Link
            href="/dashboard/try-out"
            className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
          >
            Kembali ke daftar tryout
          </Link>
        </div>
      </div>
    );
  }

  const bannerUrl = tryout.image_url || null;
  const participantsCount = Number(tryout.user_accesses_count ?? 0);
  const schedulePill = schedule ? PHASE_PILL[schedule.phase] : PENDING_PILL;

  return (
    // One screen on a desktop, and nothing that can push the page sideways.
    // The page also used to paint its own full-height white sheet over the
    // themed background, so it was the one dashboard screen with no track
    // texture behind it.
    //
    // It was a single narrow column - banner, then title, then the whole
    // subtest list, then the button - which on any real tryout meant scrolling
    // past the artwork to reach the thing you came to press.
    //
    // min-w-0 on every flex and grid child is what actually prevents the
    // horizontal scrollbar: without it a long word or a wide flex row expands
    // its track instead of wrapping.
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-5 pb-6 animate-in fade-in duration-500">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <Link
          href="/dashboard/try-out"
          className="rounded-full p-1 text-slate-800 transition-colors hover:bg-white/70"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
          Detail Try Out
        </h1>

        {/* Badges moved up here from a centred block of their own, which spent
            a whole row of vertical space saying two words. */}
        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
          <span className="rounded-full border-2 border-slate-900 bg-track-tint px-3 py-0.5 text-[11px] font-bold text-slate-900">
            {tryoutCategory}
          </span>
          <span
            className={`rounded-full border-2 border-slate-900 px-3 py-0.5 text-[11px] font-bold ${
              isFree ? "bg-white text-slate-900" : "bg-slate-900 text-white"
            }`}
          >
            {tryoutType}
          </span>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-3">
          {/* The banner an admin uploaded, which this page never showed at all -
              the artwork existed on tryouts.image and only the list rendered
              it. Falls back to the same track panel the cards use. */}
          <div className="relative h-32 w-full overflow-hidden rounded-3xl border-2 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] sm:h-40">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt={`Banner ${tryoutTitle}`}
                fill
                className="object-cover"
                unoptimized={bannerUrl.startsWith("http")}
              />
            ) : (
              <div className="flex h-full w-full flex-col justify-center gap-1.5 bg-primary px-6">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.13]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 12px)",
                  }}
                />
                <TrackIcon
                  className="pointer-events-none absolute -bottom-10 -right-8 size-48 text-white/10"
                  aria-hidden
                />
                <TrackIcon
                  className="relative size-7 text-primary-foreground"
                  aria-hidden
                />
                {/* truncate, not merely overflow-hidden on the parent: this
                    label is uppercase at 0.18em tracking, so a track name like
                    CPNS - SKD & Kedinasan is wide enough to push a narrow
                    phone sideways on its own. */}
                <span className="relative truncate text-xs font-black uppercase tracking-[0.18em] text-primary-foreground">
                  {trackConfig.full}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a]">
            <h2 className="break-words text-xl font-black leading-snug tracking-tight text-slate-900 sm:text-2xl">
              {tryoutTitle}
            </h2>

            {/* The description an admin wrote was in the payload and shown
                nowhere on this page. */}
            {tryout.description && (
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">
                {tryout.description}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="min-w-0 rounded-2xl border-2 border-dashed border-slate-200 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <Clock className="size-3.5 shrink-0 text-primary" />
                  Total waktu
                </p>
                <p className="mt-0.5 text-lg font-black text-slate-900">
                  {totalDuration}{" "}
                  <span className="text-xs font-bold text-slate-400">menit</span>
                </p>
              </div>
              <div className="min-w-0 rounded-2xl border-2 border-dashed border-slate-200 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <FileText className="size-3.5 shrink-0 text-primary" />
                  Total soal
                </p>
                <p className="mt-0.5 text-lg font-black text-slate-900">
                  {totalQuestions}{" "}
                  <span className="text-xs font-bold text-slate-400">soal</span>
                </p>
              </div>
            </div>
          </div>

          {/* Schedule and turnout. Both were in the payload already - start_date,
              end_date and user_accesses_count - and this page showed neither, so
              you could open a tryout with no idea whether it was still open. */}
          <div className="min-w-0 rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a]">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-slate-900 px-2.5 py-1 text-[11px] font-bold ${schedulePill.className}`}
              >
                {schedule?.phase === "running" ? (
                  <Radio className="size-3.5" aria-hidden />
                ) : (
                  <Clock className="size-3.5" aria-hidden />
                )}
                {schedulePill.text}
              </span>
              <span
                className={`min-w-0 break-words text-xs font-semibold ${
                  schedule?.urgent ? "text-red-600" : "text-slate-500"
                }`}
              >
                {schedule?.label ?? "Menghitung waktu..."}
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t-2 border-dashed border-slate-200 pt-3">
              <div className="flex min-w-0 items-start gap-2">
                <Calendar className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500">
                    Periode pengerjaan
                  </p>
                  <p className="break-words text-sm font-semibold text-slate-900">
                    {schedule?.dateRange ?? "-"}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-2">
                <Users className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500">
                    Peserta terdaftar
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {participantsCount.toLocaleString("id-ID")} orang
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="min-w-0">
            {isEnrolled ? (
              buttonState.action === "retry_tryout" && isFinished ? (
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => router.push(`/dashboard/try-out/${tryoutId}/start`)}
                    className={`w-full min-w-0 rounded-xl border-2 border-slate-900 px-3 py-3.5 text-sm font-bold ${buttonShadowClass} transition-all active:translate-y-1 active:shadow-none ${TRYOUT_BUTTON_CLASS[buttonState.variant]}`}
                  >
                    {buttonState.label}
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/try-out/${tryoutId}/result`)}
                    className="w-full min-w-0 rounded-xl border-2 border-slate-900 bg-primary px-3 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_4px_0_0_#0f172a] transition-all hover:brightness-95 active:translate-y-1 active:shadow-none"
                  >
                    Lihat Hasil &amp; Pembahasan
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push(`/dashboard/try-out/${tryoutId}/start`)}
                  className={`w-full rounded-xl border-2 border-slate-900 py-3.5 text-sm font-bold ${buttonShadowClass} transition-all active:translate-y-1 active:shadow-none ${TRYOUT_BUTTON_CLASS[buttonState.variant]}`}
                >
                  {buttonState.label}
                </button>
              )
            ) : (
              <button
                onClick={() => setShowEnrollDialog(true)}
                className="w-full rounded-xl border-2 border-slate-900 bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[0_4px_0_0_#0f172a] transition-all hover:brightness-95 active:translate-y-1 active:shadow-none"
              >
                {isFree ? "Daftar Tryout (Gratis)" : "Daftar Tryout (1 Tiket)"}
              </button>
            )}
          </div>
        </div>

        {/* Subtests. A long list scrolls inside this panel rather than pushing
            the button off the screen: a tryout with many subtests cannot be
            made to fit by wishing, and the action is what must stay reachable. */}
        <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a] lg:col-span-2">
          <div className="border-b-2 border-slate-900 px-5 py-3">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Rincian subtest
            </h3>
          </div>

          <div className="min-w-0 flex-1 divide-y-2 divide-dashed divide-slate-200 overflow-y-auto px-5 py-1">
            {groups.length === 0 ? (
              <p className="py-5 text-sm text-slate-500">
                Rincian subtest belum tersedia untuk tryout ini.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.category} className="min-w-0 space-y-2 py-4">
                  <h4 className="break-words text-sm font-black tracking-tight text-slate-900">
                    {group.label}
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <p>
                      <span className="font-bold text-slate-900">
                        {group.questions}
                      </span>{" "}
                      soal
                    </p>
                    <p>
                      <span className="font-bold text-slate-900">
                        {group.duration}
                      </span>{" "}
                      menit
                    </p>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {group.items.map((item) => (
                      <li key={item.name} className="flex min-w-0 items-baseline gap-2">
                        <span className="shrink-0 text-primary">&bull;</span>
                        <span className="min-w-0 break-words">
                          {item.name} : {item.questions} soal
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* Fills the space under a short list with the two things a reader
              actually wants to know before starting, both already in the
              payload and shown nowhere: how the attempt is scored, and whether
              the options get shuffled.

              The mascot stands in the corner of it. Decorative, so it is hidden
              from assistive tech - the three lines beside it already say
              everything it is there to soften. */}
          <div className="relative mt-auto min-w-0 overflow-hidden border-t-2 border-slate-900 px-5 pb-4 pt-4">
            <Mascot
              pose="semangat"
              decorative
              sizes="140px"
              className="pointer-events-none absolute -bottom-3 right-1 h-32 w-auto opacity-90"
            />

            <div className="relative flex min-w-0 flex-col gap-2 pr-24">
              <div className="flex min-w-0 items-center gap-2">
                <ListChecks className="size-4 shrink-0 text-primary" aria-hidden />
                <p className="min-w-0 text-xs text-slate-600">
                  <span className="font-bold text-slate-900">
                    {subtests.length}
                  </span>{" "}
                  subtest dikerjakan berurutan
                </p>
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <Gauge className="size-4 shrink-0 text-primary" aria-hidden />
                <p className="min-w-0 text-xs text-slate-600">
                  Penilaian{" "}
                  <span className="font-bold text-slate-900">
                    {tryout.use_irt ? "IRT" : "skor standar"}
                  </span>
                  {" - "}
                  {trackConfig.scoreScale}
                </p>
              </div>

              {tryout.randomize_options && (
                <div className="flex min-w-0 items-center gap-2">
                  <Shuffle className="size-4 shrink-0 text-primary" aria-hidden />
                  <p className="min-w-0 text-xs text-slate-600">
                    Urutan opsi jawaban diacak untuk setiap peserta
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-md p-0 rounded-2xl overflow-hidden">
          <div className="bg-primary p-6 text-white text-center">
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
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors">
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
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
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
