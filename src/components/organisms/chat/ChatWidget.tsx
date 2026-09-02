"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import ChatMarkdown from "@/components/atoms/chat/ChatMarkdown";
import { useChatStatus, useSendChat, type ChatTurn } from "@/http/ai/chat";
import { getErrorMessage } from "@/utils/get-error-message";

/**
 * Tombol asisten di kanan bawah, dan jendela chatnya.
 *
 * Yang diketahui komponen ini cuma satu endpoint: /api/chat. Provider,
 * endpoint, kunci API, dan persona seluruhnya tinggal di server - jadi tidak
 * ada satu pun kredensial yang bisa dibaca dari sini, dan mengganti provider
 * tidak menyentuh berkas ini sama sekali.
 *
 * Percakapan hanya hidup di state komponen. Menutup jendela menyimpannya
 * (supaya tidak hilang saat peserta sekadar mengintip halaman lain), tapi
 * memuat ulang halaman mengosongkannya - tidak ada transkrip yang mengendap,
 * baik di server maupun di penyimpanan browser.
 */

interface Pesan extends ChatTurn {
  /** Ditandai supaya galat bisa tampil beda tanpa masuk riwayat ke server. */
  error?: boolean;
}

const SARAN = [
  "Bahas soal ini: 2x + 5 = 17, berapa x?",
  "Jelasin cara cepat kerjain soal penalaran umum",
  "Apa saja materi TWK yang sering keluar?",
];

export default function ChatWidget() {
  const { data: session } = useSession();
  const token = (session?.access_token as string) ?? "";
  const isAdmin = session?.user?.role === "admin";

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [pesan, setPesan] = useState<Pesan[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Admin tidak mengikuti tryout, jadi tidak perlu tutor - sejalan dengan
  // pemisahan yang sudah berlaku di halaman lain.
  const { data: status } = useChatStatus({ token: isAdmin ? "" : token });
  const send = useSendChat({ token });

  const sisaKuota = status ? Math.max(0, status.daily_limit - status.used_today) : null;
  const kuotaHabis = sisaKuota === 0;

  useEffect(() => {
    // Digulirkan ke bawah setiap ada pesan baru, termasuk saat indikator
    // "sedang mengetik" muncul.
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

  const kirim = (teks: string) => {
    const isi = teks.trim();
    if (!isi || send.isPending || kuotaHabis) return;

    // Riwayat yang dikirim ke server tidak memuat baris galat - itu bukan
    // bagian dari percakapan, dan mengirimnya hanya membingungkan model.
    const riwayat: ChatTurn[] = pesan
      .filter((item) => !item.error)
      .map(({ role, content }) => ({ role, content }));

    setPesan((prev) => [...prev, { role: "user", content: isi }]);
    setDraft("");

    send.mutate(
      { message: isi, history: riwayat },
      {
        onSuccess: (result) => {
          setPesan((prev) => [...prev, { role: "assistant", content: result.data.reply }]);
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
  // Menampilkan tombol yang setiap kali diklik hanya memberi kabar buruk lebih
  // buruk daripada tidak ada tombol.
  if (isAdmin || !status?.is_available) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka asisten belajar UrClass"
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border-2 border-slate-900 bg-white py-2 pl-2 pr-4 shadow-lg transition-transform hover:scale-105 active:scale-100"
        >
          <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-track-tint">
            <Image
              src="/images/mascot/hai.webp"
              alt=""
              width={44}
              height={44}
              className="size-11 object-contain"
            />
          </span>
          <span className="text-left">
            <span className="block text-sm font-bold leading-tight text-slate-900">
              Tanya Kak UrClass
            </span>
            <span className="block text-[11px] leading-tight text-slate-500">
              Bahas soal, dapat tips
            </span>
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Asisten belajar UrClass"
          className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(620px,calc(100vh-3rem))] sm:w-[min(420px,calc(100vw-2.5rem))] sm:rounded-2xl sm:border-2 sm:border-slate-900 sm:shadow-2xl"
        >
          <header className="flex shrink-0 items-center gap-3 border-b-2 border-slate-900 bg-track-tint px-4 py-3 sm:rounded-t-2xl">
            <Image
              src="/images/mascot/hai.webp"
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 object-contain"
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

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {pesan.length === 0 && (
              <div className="flex flex-col items-center pt-4 text-center">
                <Image
                  src="/images/mascot/ayobelajar.webp"
                  alt=""
                  width={120}
                  height={120}
                  className="size-28 object-contain"
                />
                <p className="mt-2 text-sm font-bold text-slate-900">
                  Ada soal yang bikin mentok?
                </p>
                <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-slate-500">
                  Tulis soalnya di bawah. Nanti aku kasih jawaban, pembahasan, dan
                  tipsnya sekalian.
                </p>

                <div className="mt-4 w-full space-y-2">
                  {SARAN.map((saran) => (
                    <button
                      key={saran}
                      type="button"
                      onClick={() => kirim(saran)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
                    >
                      {saran}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pesan.map((item, index) =>
              item.role === "user" ? (
                <div key={index} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-slate-900 px-3.5 py-2 text-sm leading-relaxed text-white">
                    {item.content}
                  </p>
                </div>
              ) : (
                <div key={index} className="flex gap-2">
                  <Image
                    src={item.error ? "/images/mascot/kecewa.webp" : "/images/mascot/laptop.webp"}
                    alt=""
                    width={28}
                    height={28}
                    className="mt-0.5 size-7 shrink-0 object-contain"
                  />
                  <div
                    className={`min-w-0 max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm ${
                      item.error
                        ? "border border-amber-200 bg-amber-50 text-amber-900"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.error ? (
                      <p className="leading-relaxed">{item.content}</p>
                    ) : (
                      <ChatMarkdown text={item.content} />
                    )}
                  </div>
                </div>
              ),
            )}

            {send.isPending && (
              <div className="flex items-center gap-2">
                <Image
                  src="/images/mascot/berfikir.webp"
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 shrink-0 object-contain"
                />
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5">
                  <Loader2 className="size-3.5 animate-spin text-slate-400" />
                  <span className="text-xs text-slate-500">Sedang mikir...</span>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 px-3 py-3 sm:rounded-b-2xl">
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
                  className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-900"
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
        </div>
      )}
    </>
  );
}
