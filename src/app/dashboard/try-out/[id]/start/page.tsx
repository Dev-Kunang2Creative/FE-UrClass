"use client";

import { useState, use, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ScrollText, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG } from "@/lib/kategori";
import {
  describeScoring,
  groupSubtests,
  summariseSubtests,
} from "@/lib/tryout-subtests";
import Mascot from "@/components/atoms/mascot/Mascot";
import { useStartTryout, type StartTryoutResponse } from "@/http/tryout/start-tryout";
import { useGetUserTryoutDetail } from "@/http/tryout/get-user-tryout-detail";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import { notifyTicketBalanceUpdated } from "@/hooks/useTickets";

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
  const trackConfig = KATEGORI_CONFIG[kategori];


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

  const scoring = describeScoring(tryout?.tryout_subtests);

  // Percobaan pertama sudah dibayar saat mendaftar. Yang memotong tiket lagi
  // hanya pengerjaan ulang tryout premium - dan harganya disebut sebelum
  // tombolnya ditekan, bukan setelah saldo berkurang.
  const willSpendTicket =
    tryout?.is_free === false &&
    Number(tryout?.user_attempt_count ?? 0) > 0 &&
    tryout?.user_session_status === "finished";

  const allSubtests = summariseSubtests(
    tryout?.tryout_subtests,
    isCpns ? "SKD" : "TPS",
  );

  const totalQuestions = allSubtests.reduce((s, t) => s + t.questions, 0);
  const totalDuration = allSubtests.reduce((s, t) => s + t.duration, 0);

  // Same grouping and the same labels as the detail page, so a CPNS reader is
  // not told "Tes Potensi Skolastik" on one screen and "SKD" on the next.
  const groups = useMemo(
    () => groupSubtests(allSubtests, kategori),
    [allSubtests, kategori],
  );

  const startTryoutMutation = useStartTryout({
    token,
    options: {
      onSuccess: (data: StartTryoutResponse) => {
        // Satu tiket untuk satu kali pengerjaan, jadi mengulang tryout premium
        // memotong tiket lagi. Saldo di header harus ikut berubah saat itu juga,
        // bukan setelah sesi berikutnya dimuat ulang.
        if (data.ticket_balance_remaining != null) {
          notifyTicketBalanceUpdated({
            ticketBalance: data.ticket_balance_remaining,
            delta: -1,
            suppressModal: true,
          });
          toast.success("1 tiket digunakan untuk pengerjaan ulang ini.");
        }

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
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    // Read on the left, act on the right, one screen on a desktop. It was a
    // single column - banner, title, every subtest, eight rules, checkbox,
    // button - so the thing you came to press sat several screens below the
    // fold, and the page painted its own white sheet over the themed
    // background on the way there.
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-5 pb-6 animate-in fade-in duration-500">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <Link
          href={`/dashboard/try-out/${tryoutId}`}
          className="rounded-full p-1 text-slate-800 transition-colors hover:bg-white/70"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="min-w-0 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
          Instruksi Tryout
        </h1>
        <span className="ml-auto shrink-0 rounded-full border-2 border-slate-900 bg-track-tint px-3 py-0.5 text-[11px] font-bold text-slate-900">
          {trackConfig.label}
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:h-[calc(100vh-7.5rem)] lg:grid-cols-5">
        {/* Rules. The one thing on this page that has to be read, so it gets
            the wide column and scrolls inside itself rather than pushing the
            start button away. */}
        <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a] lg:col-span-3 lg:h-full">
          <div className="flex min-w-0 items-center gap-2 border-b-2 border-slate-900 px-5 py-3">
            <ScrollText className="size-4 shrink-0 text-primary" aria-hidden />
            <h2 className="min-w-0 truncate text-sm font-black uppercase tracking-wide text-slate-900">
              Aturan pengerjaan
            </h2>
          </div>

          {/* Every rule here matches behaviour that exists in the code, and
              several were missing from the eight generic lines this replaced -
              the timer running server-side while you are away is the one a
              reader most needs and was least likely to guess.

              TryoutSubtestSession stores started_at and the endpoint derives
              the deadline from it, so closing the tab does not pause anything;
              once it passes the subtest flips to expired and returns no
              questions. Answers post one at a time as they are chosen. On
              time-up the exam screen auto-submits and advances. */}
          <ol className="min-h-0 min-w-0 flex-1 list-decimal space-y-2.5 overflow-y-auto py-4 pl-10 pr-5 text-sm leading-relaxed text-slate-700">
            <li>Timer langsung berjalan begitu tombol Mulai Tryout ditekan.</li>
            <li>
              Setiap subtest punya batas waktunya sendiri. Waktunya dihitung di
              server, jadi{" "}
              <span className="font-bold text-slate-900">
                tetap berjalan walau kamu menutup tab atau koneksimu terputus
              </span>
              .
            </li>
            <li>
              Kalau sempat keluar, kamu bisa masuk lagi dan lanjut dari subtest
              terakhir - tapi waktu yang sudah lewat tidak dikembalikan.
            </li>
            <li>
              Setiap jawaban langsung tersimpan saat kamu memilihnya. Tidak ada
              tombol simpan.
            </li>
            <li>
              Kalau waktu satu subtest habis, jawaban yang sudah masuk otomatis
              dikumpulkan dan kamu lanjut ke subtest berikutnya.
            </li>
            <li>
              Subtest yang sudah selesai atau waktunya habis tidak bisa
              dikerjakan lagi, jadi selesaikan sebelum lanjut.
            </li>
            <li>
              Kalau masih ada soal kosong saat menekan Selesai Subtest, sistem
              memberi peringatan dulu - bukan langsung mengumpulkan.
            </li>
            {/* Read off the subtests rather than assumed: ScoringService takes
                score_wrong from each one, and an admin can set it negative. If
                the payload does not carry the figures, this line is omitted
                instead of guessing. */}
            {scoring && (
              <li>
                {scoring.penalisesWrong
                  ? "Jawaban salah mengurangi nilai di sebagian subtest, jadi menebak ada risikonya."
                  : "Jawaban salah tidak mengurangi nilai, jadi lebih baik menebak daripada dikosongkan."}
                {scoring.emptyIsZero && " Soal yang dikosongkan bernilai nol."}
              </li>
            )}
            {tryout?.randomize_options && (
              <li>
                Urutan opsi jawaban diacak untuk setiap peserta, jadi jangan
                menyalin urutan dari orang lain.
              </li>
            )}
            {/* The ticket charge applies to free tryouts only. review computes
                isUnlocked as !is_free || discussion_unlocked, and
                unlockDiscussion refuses outright when the tryout is not free -
                so on a premium tryout the discussion is open the moment it is
                finished. Stating the charge unconditionally was wrong, and
                wrong on exactly the kind of tryout that shows this page. */}
            <li>
              {tryout?.is_free
                ? "Pembahasan dan kunci jawaban dibuka dengan 1 tiket setelah tryout selesai, terpisah dari tiket untuk mengerjakan."
                : "Pembahasan dan kunci jawaban langsung terbuka setelah tryout selesai - sudah termasuk dalam tiket yang kamu pakai."}
            </li>
            <li>
              Siapkan{" "}
              <span className="font-bold text-slate-900">
                {totalDuration} menit
              </span>{" "}
              tanpa gangguan, koneksi yang stabil, dan perangkat yang nyaman
              dipakai selama itu.
            </li>
          </ol>

          <div className="flex min-w-0 items-end gap-3 border-t-2 border-slate-900 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black tracking-tight text-slate-900">
                {tryoutTitle}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                <span className="font-bold text-slate-900">{totalDuration}</span>{" "}
                menit &middot;{" "}
                <span className="font-bold text-slate-900">{totalQuestions}</span>{" "}
                soal &middot;{" "}
                <span className="font-bold text-slate-900">
                  {allSubtests.length}
                </span>{" "}
                subtest
              </p>
            </div>
            <Mascot
              pose="ayobelajar"
              decorative
              sizes="140px"
              className="h-24 w-auto shrink-0 lg:h-28"
            />
          </div>
        </div>

        {/* Subtests, then the consent and the action. */}
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-2 lg:h-full">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0px_0px_#0f172a]">
            <div className="shrink-0 border-b-2 border-slate-900 px-5 py-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
                Yang akan dikerjakan
              </h2>
            </div>
            <div className="min-h-0 min-w-0 flex-1 divide-y-2 divide-dashed divide-slate-200 overflow-y-auto px-5 py-1">
              {groups.length === 0 ? (
                <p className="py-4 text-sm text-slate-500">
                  Rincian subtest belum tersedia.
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.category} className="min-w-0 space-y-1.5 py-3">
                    <h3 className="break-words text-xs font-black tracking-tight text-slate-900">
                      {group.label}
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {group.items.map((item) => (
                        <li
                          key={item.name}
                          className="flex min-w-0 items-baseline gap-2"
                        >
                          <span className="shrink-0 text-primary">&bull;</span>
                          <span className="min-w-0 break-words">
                            {item.name} : {item.questions} soal ({item.duration}{" "}
                            mnt)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="min-w-0 shrink-0 rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0f172a]">
            <label className="flex min-w-0 cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="hidden"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              {/* Was a hardcoded #1E3A8A, which put navy on a CPNS reader
                  screen next to an orange button. */}
              <span
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  isChecked
                    ? "border-slate-900 bg-primary text-primary-foreground"
                    : "border-slate-300"
                }`}
              >
                {isChecked && <Check className="size-4" aria-hidden />}
              </span>
              <span className="min-w-0 text-xs leading-relaxed text-slate-700">
                Saya sudah membaca dan memahami instruksinya. Timer berjalan
                segera setelah tombol ditekan.
              </span>
            </label>

            {/* Was #3B9245 with a #2b6a32 shadow - a green belonging to neither
                track, on the most important button in the flow. */}
            <button
              disabled={!isChecked || isStarting}
              onClick={() => setIsConfirmOpen(true)}
              className={`mt-4 w-full rounded-xl border-2 py-3.5 text-sm font-bold transition-all ${
                isChecked && !isStarting
                  ? "cursor-pointer border-slate-900 bg-primary text-primary-foreground shadow-[0_4px_0_0_#0f172a] active:translate-y-1 active:shadow-none"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              {isStarting ? "Memulai..." : "Mulai Tryout"}
            </button>
          </div>
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
              {willSpendTicket ? "Kerjakan Ulang Tryout Ini?" : "Siap Mulai Tryout?"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-4 px-2">
              Pastikan kamu sudah siap. Setelah dimulai, waktu pengerjaan akan langsung berjalan.
              {willSpendTicket && (
                <span className="mt-2 block font-semibold text-slate-900">
                  Pengerjaan ulang ini memotong 1 tiket. Satu tiket berlaku
                  untuk satu kali pengerjaan.
                </span>
              )}
            </DialogDescription>
            <div className="flex w-full gap-3 pt-2">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 cursor-pointer rounded-xl border-2 border-slate-900 bg-white py-3 font-bold text-slate-900 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <button 
                onClick={handleStartExam}
                className="flex-1 cursor-pointer rounded-xl border-2 border-slate-900 bg-primary py-3 font-bold text-primary-foreground transition-all hover:brightness-95 active:translate-y-0.5"
              >
                {willSpendTicket ? "Ya, Pakai 1 Tiket" : "Mulai Try Out"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
