"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, FileText, Clock, Ticket, Upload, X, ExternalLink, Calendar, Users, Radio, ListChecks, Gauge, Shuffle } from "lucide-react";
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
import { useGetProofRequirements } from "@/http/proof-requirements/proof-requirements";
import { proofIconOf } from "@/lib/proof-icons";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import { getTryoutButtonState, TRYOUT_BUTTON_CLASS } from "@/utils/tryout-button-state";
import { useKategori } from "@/hooks/useKategori";
import { useSchedule } from "@/hooks/useSchedule";
import Mascot from "@/components/atoms/mascot/Mascot";
import { PENDING_PILL, PHASE_PILL } from "@/lib/tryout-schedule";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import { groupSubtests, summariseSubtests } from "@/lib/tryout-subtests";

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
  // Bukti disimpan per id syarat, bukan sebagai array berurutan: slotnya bisa
  // diisi dalam urutan apa pun, dan yang dikirim ke server harus tetap tahu
  // gambar mana menjawab syarat mana.
  const [proofFiles, setProofFiles] = useState<Record<string, File>>({});
  const [proofPreviews, setProofPreviews] = useState<Record<string, string>>({});

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

  // Satu slot unggahan untuk satu syarat. Server memvalidasi dengan daftar yang
  // sama, jadi tombol daftar tidak boleh aktif sebelum semua slot terisi.
  const { data: proofData } = useGetProofRequirements({ token });
  const proofRequirements = proofData?.data ?? [];
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
    isFree: tryout?.is_free,
  });
  // One shadow for both variants. The old pair hardcoded yellow-700 and a
  // green, matching variant names that no longer exist and neither track.
  const buttonShadowClass = "shadow-[0_4px_0_0_#0f172a]";
  const tryoutTitle = tryout?.title || "";
  const isFree = tryout?.is_free ?? true;
  const tryoutType = isFree ? "Gratis" : "Premium";
  const tryoutCategory = tryout?.category || "-";

  // Shared with the instructions screen, which read questions_count while this
  // page read max_questions - so the same tryout was announced as 160 soal here
  // and 19 one click later.
  const subtests = summariseSubtests(
    tryout?.tryout_subtests,
    kategori === "cpns" ? "SKD" : "TPS",
  );

  const totalQuestions = subtests.reduce((sum, s) => sum + s.questions, 0);
  const totalDuration = subtests.reduce((sum, s) => sum + s.duration, 0);

  // Shared with the pre-exam instructions, so the same tryout cannot be
  // described two ways on two consecutive screens.
  const groups = groupSubtests(subtests, kategori);

  // Enroll mutation
  const enrollMutation = useEnrollTryout({
    token,
    options: {
      onSuccess: () => {
        setShowEnrollDialog(false);
        setProofFiles({});
        setProofPreviews({});
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
      proofs: isFree ? proofFiles : undefined,
    });
  };

  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_FILE_SIZE_MB = 2;

  // Semua syarat aktif harus terisi. Aturannya sama di server, jadi tombol
  // daftar dikunci sampai terpenuhi daripada membiarkan peserta mengirim lalu
  // menerima 422.
  const missingProofs = proofRequirements.filter((item) => !proofFiles[item.id]);
  const proofsComplete = proofRequirements.length > 0 && missingProofs.length === 0;

  const handleProofChange = (
    requirementId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran gambar melebihi batas ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    // Satu slot menampung satu gambar: memilih ulang menggantikan yang lama,
    // bukan menumpuk. Itu yang diharapkan dari slot berlabel.
    setProofFiles((current) => ({ ...current, [requirementId]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreviews((current) => ({
        ...current,
        [requirementId]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeProof = (requirementId: string) => {
    setProofFiles((current) => {
      const next = { ...current };
      delete next[requirementId];
      return next;
    });
    setProofPreviews((current) => {
      const next = { ...current };
      delete next[requirementId];
      return next;
    });
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

              The mascot stands beside it, in normal flow rather than absolutely
              positioned: pinned with a negative offset inside an
              overflow-hidden panel it was simply cut off, and a row that grows
              to fit it cannot clip it at any size. Decorative, so it is hidden
              from assistive tech - the lines next to it already say everything
              it is there to soften. */}
          <div className="mt-auto flex min-w-0 items-end gap-3 border-t-2 border-slate-900 px-5 py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
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

            <Mascot
              pose="semangat"
              decorative
              sizes="160px"
              className="h-28 w-auto shrink-0 lg:h-36"
            />
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
                ? "Penuhi syarat berikut untuk mendaftar"
                : `Kamu akan menggunakan 1 tiket. Sisa tiket: ${ticketCount}`
              }
            </DialogDescription>
          </div>

          <div className="p-6 space-y-5">
            {isFree ? (
              <>
                <div className="space-y-3">
                  {/* Slot, judul, dan instruksinya seluruhnya dari server -
                      tidak ada yang ditulis di sini. Server memvalidasi dengan
                      daftar yang sama, jadi teks yang ditulis tangan pasti akan
                      menyimpang begitu syaratnya diubah admin. */}
                  <div>
                    <label className="font-semibold text-gray-800 text-sm block">
                      Syarat pendaftaran
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {proofRequirements.length > 0
                        ? `Penuhi ${proofRequirements.length} syarat berikut, lalu unggah tangkapan layarnya di masing-masing slot.`
                        : "Memuat syarat pendaftaran..."}
                    </p>
                  </div>

                  {proofRequirements.map((requirement, index) => {
                    const { Icon, className } = proofIconOf(requirement.icon);
                    const preview = proofPreviews[requirement.id];

                    return (
                      <div
                        key={requirement.id}
                        className={`rounded-xl border-2 p-3 transition-colors ${
                          preview
                            ? "border-green-400 bg-green-50/50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                              <Icon className={`size-4 shrink-0 ${className}`} />
                              <span className="min-w-0">{requirement.title}</span>
                            </p>

                            {requirement.instruction && (
                              <p className="text-xs leading-relaxed text-gray-500">
                                {requirement.instruction}
                              </p>
                            )}

                            {requirement.link_url && (
                              <a
                                href={requirement.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700 transition-colors hover:bg-pink-100"
                              >
                                {requirement.link_label || "Buka tautan"}
                                <ExternalLink className="size-3 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5">
                          {preview ? (
                            <div className="relative overflow-hidden rounded-lg border border-green-300">
                              <img
                                src={preview}
                                alt={`Bukti untuk ${requirement.title}`}
                                className="h-28 w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeProof(requirement.id)}
                                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                                aria-label={`Hapus bukti untuk ${requirement.title}`}
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-primary hover:bg-gray-50">
                              <Upload className="mb-1 size-5 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500">
                                Unggah tangkapan layar
                              </span>
                              <span className="mt-0.5 text-[11px] text-gray-400">
                                JPG, PNG, WebP — maks 2MB
                              </span>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(event) => handleProofChange(requirement.id, event)}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Menyebut syarat mana yang belum, bukan hanya "belum
                      lengkap": dengan tiga slot, peserta perlu tahu yang mana. */}
                  {proofRequirements.length > 0 && missingProofs.length > 0 && (
                    <p className="text-xs text-amber-700">
                      Belum diunggah: {missingProofs.map((item) => item.title).join(", ")}.
                    </p>
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
                  (isFree && !proofsComplete) || 
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
