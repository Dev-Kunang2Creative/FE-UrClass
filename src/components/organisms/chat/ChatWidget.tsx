"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import ChatMarkdown from "@/components/atoms/chat/ChatMarkdown";
import { useTypewriter } from "@/components/atoms/chat/useTypewriter";
import { useChatStatus, useSendChat, type ChatTurn, type ChatUsage } from "@/http/ai/chat";
import { getErrorMessage } from "@/utils/get-error-message";

/**
 * Asisten belajar: maskot di kanan bawah, dan panel chat yang membuka di
 * sebelah kanan.
 *
 * Yang diketahui komponen ini cuma satu endpoint: /api/chat. Provider,
 * endpoint, kunci API, dan persona seluruhnya tinggal di server - jadi tidak
 * ada satu pun kredensial yang bisa dibaca dari sini, dan mengganti provider
 * tidak menyentuh berkas ini sama sekali.
 *
 * Percakapan hanya hidup di state komponen. Menutup panel menyimpannya (supaya
 * tidak hilang saat peserta sekadar mengintip halaman lain), tapi memuat ulang
 * halaman mengosongkannya - tidak ada transkrip yang mengendap, baik di server
 * maupun di penyimpanan browser.
 */

interface Pesan extends ChatTurn {
  /** Ditandai supaya galat tampil beda tanpa masuk riwayat ke server. */
  error?: boolean;
  /** Angka dari provider, hanya ada pada balasan yang berhasil. */
  usage?: ChatUsage;
  /** Balasan yang baru tiba dianimasikan; yang lama tampil utuh. */
  fresh?: boolean;
}

const SARAN = [
  "Bahas soal ini: 2x + 5 = 17, berapa x?",
  "Jelasin cara cepat kerjain soal penalaran umum",
  "Materi TWK apa yang paling sering keluar?",
];

export default function ChatWidget() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";
  const isAdmin = session?.user?.role === "admin";

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [pesan, setPesan] = useState<Pesan[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Admin tidak mengikuti tryout, jadi tidak perlu tutor - sejalan dengan
  // pemisahan yang sudah berlaku di halaman lain.
  const { data: status } = useChatStatus({ token: isAdmin ? "" : token });
  const send = useSendChat({ token });

  const sisaKuota = status ? Math.max(0, status.daily_limit - status.used_today) : null;
  const kuotaHabis = sisaKuota === 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [pesan, send.isPending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Waktu tunggu dihitung supaya indikatornya tidak terasa menggantung. Jawaban
  // dari model bisa perlu beberapa detik, dan angka yang bergerak memberi tahu
  // bahwa sesuatu memang sedang berjalan.
  //
  // Penghitungnya dinolkan di dalam kirim(), bukan di effect ini: menyetel state
  // secara sinkron di badan effect adalah pola yang eslint tolak, dan effect ini
  // cukup mengurus interval-nya saja.
  useEffect(() => {
    if (!send.isPending) {
      return;
    }

    const mulai = Date.now();
    const timer = setInterval(() => setElapsed(Math.round((Date.now() - mulai) / 100) / 10), 100);

    return () => clearInterval(timer);
  }, [send.isPending]);

  /**
   * Melepas tanda `fresh` setelah animasinya selesai.
   *
   * Tanpa ini, menutup lalu membuka panel membuat seluruh jawaban lama mengetik
   * ulang dari nol: komponen pesannya lahir baru, dan `fresh` yang masih menyala
   * memberitahunya untuk menganimasikan lagi. Animasi hanya untuk jawaban yang
   * baru tiba - sekali, bukan setiap kali dilihat.
   */
  const tandaiSudahDianimasikan = (index: number) =>
    setPesan((prev) =>
      prev[index]?.fresh
        ? prev.map((item, i) => (i === index ? { ...item, fresh: false } : item))
        : prev,
    );

  const kirim = (teks: string) => {
    const isi = teks.trim();
    if (!isi || send.isPending || kuotaHabis) return;

    // Riwayat yang dikirim ke server tidak memuat baris galat - itu bukan
    // bagian dari percakapan, dan mengirimnya hanya membingungkan model.
    const riwayat: ChatTurn[] = pesan
      .filter((item) => !item.error)
      .map(({ role, content }) => ({ role, content }));

    setElapsed(0);

    setPesan((prev) => [...prev, { role: "user", content: isi }]);
    setDraft("");

    send.mutate(
      { message: isi, history: riwayat },
      {
        onSuccess: (result) => {
          setPesan((prev) => [
            ...prev,
            {
              role: "assistant",
              content: result.data.reply,
              usage: result.data.usage,
              fresh: true,
            },
          ]);
        },
        onError: (error) => {
          setPesan((prev) => [
            ...prev,
            {
              role: "assistant",
              content: getErrorMessage(error, "Gagal menjawab. Coba lagi sebentar."),
              error: true,
            },
          ]);
        },
      },
    );
  };

  // Tombolnya tidak dirender sama sekali kalau asistennya belum dikonfigurasi.
  // Tombol yang setiap kali diklik hanya memberi kabar buruk lebih buruk
  // daripada tidak ada tombol.
  if (isAdmin || !status?.is_available) return null;

  return (
    <>
      {!open && <MascotButton onClick={() => setOpen(true)} />}

      {/* Panel kanan setinggi layar, seperti panel samping editor - bukan pop-up
          kecil. Di layar sempit ia mengambil seluruh layar, karena panel 40%
          pada lebar ponsel tidak menyisakan ruang untuk membaca pembahasan. */}
      {open && (
        <>
          {/* Latar gelap hanya di layar sempit: di desktop panel ini hidup
              bersama halaman, dan menggelapkan halaman akan menyiratkan
              halamannya tidak bisa dipakai. */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
            aria-hidden
          />

          <aside
            role="dialog"
            aria-label="Asisten belajar UrClass"
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-slate-200 bg-white shadow-2xl sm:w-[26rem] lg:w-[42vw] lg:max-w-[40rem] lg:border-l"
          >
            <header className="flex shrink-0 items-center gap-3 border-b bg-track-tint px-4 py-3">
              <Image
                src="/images/mascot/hai.webp"
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">Kak UrClass</p>
                <p className="truncate text-[11px] text-slate-600">
                  {sisaKuota !== null ? `Sisa ${sisaKuota} pesan hari ini` : "Siap bantu"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup asisten"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-900"
              >
                <X className="size-4" />
              </button>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {pesan.length === 0 && <EmptyState onPick={kirim} />}

              {pesan.map((item, index) =>
                item.role === "user" ? (
                  <div key={index} className="flex justify-end">
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-slate-900 px-3.5 py-2 text-sm leading-relaxed text-white">
                      {item.content}
                    </p>
                  </div>
                ) : (
                  <AssistantMessage
                    key={index}
                    pesan={item}
                    onTyped={() => tandaiSudahDianimasikan(index)}
                  />
                ),
              )}

              {send.isPending && <Thinking elapsed={elapsed} />}
            </div>

            <div className="shrink-0 border-t px-4 py-3">
              {kuotaHabis ? (
                <p className="px-1 py-2 text-center text-xs text-slate-500">
                  Kuota chat hari ini sudah habis. Balik lagi besok ya.
                </p>
              ) : (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      // Enter mengirim, Shift+Enter baris baru - soal sering
                      // perlu ditulis beberapa baris.
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        kirim(draft);
                      }
                    }}
                    rows={1}
                    maxLength={status.max_message_length}
                    placeholder="Tulis soal atau pertanyaanmu..."
                    className="max-h-40 min-h-10 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => kirim(draft)}
                    disabled={!draft.trim() || send.isPending}
                    aria-label="Kirim pesan"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              )}

              <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <Sparkles className="size-3" />
                Jawaban AI bisa keliru — cek ulang yang penting
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

/**
 * Maskot sebagai tombolnya sendiri: tanpa kotak, tanpa garis tepi.
 *
 * Gelembung di atasnya yang memperkenalkan diri, karena maskot tanpa teks tidak
 * memberi tahu apa yang terjadi kalau diklik.
 */
function MascotButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka asisten belajar Kak UrClass"
      className="group fixed bottom-5 right-5 z-40 flex flex-col items-center gap-1.5"
    >
      <span className="relative max-w-[11rem] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center shadow-lg transition-transform group-hover:-translate-y-0.5">
        <span className="block text-xs font-bold leading-tight text-slate-900">
          Hai, aku Kak UrClass!
        </span>
        <span className="mt-0.5 block text-[11px] leading-tight text-slate-500">
          Klik aku buat bahas soal
        </span>

        {/* Ekor gelembung: dua lapis supaya garis tepinya tersambung mulus. */}
        <span
          aria-hidden
          className="absolute -bottom-[7px] right-7 size-3 rotate-45 border-b border-r border-slate-200 bg-white"
        />
      </span>

      <Image
        src="/images/mascot/hai.webp"
        alt=""
        width={96}
        height={96}
        priority
        className="size-20 object-contain drop-shadow-md transition-transform group-hover:scale-105 group-active:scale-100 sm:size-24"
      />
    </button>
  );
}

function EmptyState({ onPick }: { onPick: (teks: string) => void }) {
  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <Image
        src="/images/mascot/ayobelajar.webp"
        alt=""
        width={140}
        height={140}
        className="size-32 object-contain"
      />
      <p className="mt-3 text-sm font-bold text-slate-900">Ada soal yang bikin mentok?</p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
        Tulis soalnya di bawah. Nanti aku kasih jawaban, pembahasan, dan tipsnya
        sekalian.
      </p>

      <div className="mt-5 w-full max-w-sm space-y-2">
        {SARAN.map((saran) => (
          <button
            key={saran}
            type="button"
            onClick={() => onPick(saran)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs leading-relaxed text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            {saran}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Kalimat tunggu, bergantian.
 *
 * Satu kalimat tetap membuat jeda beberapa detik terasa seperti macet. Yang
 * bergantian memberi tahu bahwa sesuatu masih berjalan - dan urutannya dibuat
 * menyerupai langkah yang memang ditempuh saat membahas soal, jadi ia bukan
 * sekadar hiasan.
 */
const KALIMAT_TUNGGU = [
  "Baca soalnya dulu...",
  "Cari konsep yang dipakai...",
  "Nyusun pembahasannya...",
  "Ngecek jawabannya...",
  "Nyiapin tips & trick...",
];

/** Jeda ganti kalimat. Cukup lama untuk dibaca, cukup singkat untuk terasa hidup. */
const GANTI_KALIMAT_MS = 2200;

function Thinking({ elapsed }: { elapsed: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % KALIMAT_TUNGGU.length),
      GANTI_KALIMAT_MS,
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-2.5">
      <Image
        src="/images/mascot/berfikir.webp"
        alt=""
        width={32}
        height={32}
        className="mt-0.5 size-8 shrink-0 object-contain"
      />
      <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Loader2 className="size-3.5 animate-spin text-slate-400" />
          <span
            key={index}
            className="animate-in fade-in text-xs font-medium text-slate-600 duration-500"
          >
            {KALIMAT_TUNGGU[index]}
          </span>
        </div>
        <p className="mt-1 text-[11px] tabular-nums text-slate-400">{elapsed.toFixed(1)}s</p>
      </div>
    </div>
  );
}

function AssistantMessage({ pesan, onTyped }: { pesan: Pesan; onTyped: () => void }) {
  const { visible, typing, skip } = useTypewriter(pesan.content, Boolean(pesan.fresh), onTyped);

  return (
    <div className="flex gap-2.5">
      <Image
        src={pesan.error ? "/images/mascot/kecewa.webp" : "/images/mascot/laptop.webp"}
        alt=""
        width={32}
        height={32}
        className="mt-0.5 size-8 shrink-0 object-contain"
      />

      <div className="min-w-0 flex-1">
        <div
          className={`min-w-0 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm ${
            pesan.error
              ? "border border-amber-200 bg-amber-50 text-amber-900"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {pesan.error ? (
            <p className="leading-relaxed">{pesan.content}</p>
          ) : (
            <>
              <ChatMarkdown text={visible} />
              {typing && (
                <span
                  aria-hidden
                  className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-slate-400 align-middle"
                />
              )}
            </>
          )}
        </div>

        {/* Angka provider, bukan perkiraan. Ditampilkan setelah animasi selesai
            supaya tidak bersaing perhatian dengan teks yang sedang muncul. */}
        {!pesan.error && pesan.usage && !typing && (
          <p className="mt-1 px-1 text-[10px] tabular-nums text-slate-400">
            {pesan.usage.input_tokens.toLocaleString("id-ID")} token masuk ·{" "}
            {pesan.usage.output_tokens.toLocaleString("id-ID")} keluar
            {pesan.usage.cached_tokens > 0 &&
              ` · ${pesan.usage.cached_tokens.toLocaleString("id-ID")} dari cache`}
          </p>
        )}

        {/* Menunggu animasi selesai tidak boleh dipaksakan ke orang yang sudah
            membaca lebih cepat. */}
        {typing && (
          <button
            type="button"
            onClick={skip}
            className="mt-1 px-1 text-[10px] font-semibold text-slate-400 transition-colors hover:text-slate-700 hover:underline"
          >
            Tampilkan langsung
          </button>
        )}
      </div>
    </div>
  );
}
