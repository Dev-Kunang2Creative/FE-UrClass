"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import type { ExamQuestion, ExamTimerData } from "@/types/exam/exam";
import { SubmitAnswerHandler } from "@/http/tryout/submit-answer";
import { FinishTryoutHandler } from "@/http/tryout/finish-tryout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ExamTimer from "./ExamTimer";
import QuestionView from "./QuestionView";
import { getErrorMessage } from "@/utils/get-error-message";

interface DataUjian {
  tryout: { id: string; title: string };
  timer: ExamTimerData;
  questions: ExamQuestion[];
}

function SoalCpns({ data, token }: { data: DataUjian; token: string }) {
  const router = useRouter();
  const cache = useQueryClient();
  const [indeks, setIndeks] = useState(0);
  const [filter, setFilter] = useState("Semua");
  const [jawaban, setJawaban] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(data.questions.map((q) => [q.id, q.my_answer])),
  );
  const [menyimpan, setMenyimpan] = useState(false);
  const [mengakhiri, setMengakhiri] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [habis, setHabis] = useState(false);
  const [galat, setGalat] = useState("");
  const [sisaAwal] = useState(() =>
    Math.max(
      0,
      Math.ceil((Date.parse(data.timer.end_time) - Date.now()) / 1000),
    ),
  );
  const pending = useRef<Promise<unknown>>(Promise.resolve());
  const sedangSelesai = useRef(false);
  const soal = data.questions[indeks];
  const terjawab = Object.values(jawaban).filter(
    (value) => value !== null && value !== "",
  ).length;

  const selesai = useCallback(async () => {
    if (sedangSelesai.current) return;
    sedangSelesai.current = true;
    setMengakhiri(true);
    setGalat("");
    try {
      await pending.current;
      await FinishTryoutHandler(data.tryout.id, token);
      await Promise.all(
        ["get-tryout-result", "get-user-tryout-detail", "get-user-tryouts", "get-tryout-leaderboard"].map(
          (key) => cache.invalidateQueries({ queryKey: [key], refetchType: "none" }),
        ),
      );
      router.replace(`/dashboard/try-out/${data.tryout.id}/result`);
    } catch (error) {
      setGalat(
        getErrorMessage(
          error,
          "Tryout belum berhasil diselesaikan. Coba lagi.",
        ),
      );
      sedangSelesai.current = false;
      setMengakhiri(false);
    }
  }, [cache, data.tryout.id, router, token]);

  const waktuHabis = useCallback(() => {
    setHabis(true);
    void selesai();
  }, [selesai]);
  if (!soal)
    return (
      <div className="p-6">
        <p>Belum ada soal aktif pada tryout ini.</p>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/try-out/${data.tryout.id}`)}
        >
          Kembali ke Tryout
        </Button>
      </div>
    );

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="max-w-lg truncate font-semibold">{data.tryout.title}</p>
          <p className="text-sm text-muted-foreground">
            {soal.category} · Soal {indeks + 1} dari {data.questions.length}
          </p>
        </div>
        <ExamTimer remainingSeconds={sisaAwal} onTimeUp={waktuHabis} />
        <Button
          variant="outline"
          disabled={menyimpan || mengakhiri}
          onClick={() => router.push(`/dashboard/try-out/${data.tryout.id}`)}
        >
          Keluar Sementara
        </Button>
      </header>
      {galat && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 text-destructive"
        >
          <p>{galat}</p>
          {habis && (
            <Button onClick={() => void selesai()} disabled={mengakhiri}>
              Selesaikan Tryout
            </Button>
          )}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <aside className="flex w-full shrink-0 flex-col gap-4 border-b p-4 lg:w-80 lg:overflow-y-auto lg:border-r lg:border-b-0">
          <p className="text-sm text-muted-foreground">
            Satu waktu untuk seluruh subtes. Kamu bebas berpindah soal selama
            waktu masih tersedia.
          </p>
          <fieldset>
            <legend className="mb-2 font-semibold">Pilih bagian soal</legend>
            <div className="flex flex-wrap gap-2">
              {[
                "Semua",
                ...new Set(data.questions.map((q) => q.category ?? "Lainnya")),
              ].map((kode) => {
                const indexes = data.questions.flatMap((q, i) =>
                  kode === "Semua" || q.category === kode ? [i] : [],
                );
                return (
                  <label key={kode} className="cursor-pointer">
                    <input
                      type="radio"
                      name="bagian-soal"
                      className="peer sr-only"
                      checked={filter === kode}
                      onChange={() => {
                        setFilter(kode);
                        setIndeks(indexes[0]);
                      }}
                    />
                    <span className="flex min-h-11 items-center rounded-full border px-3 text-sm peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                      {kode}: {indexes[0] + 1}–{indexes.at(-1)! + 1}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <p className="text-sm" role="status">
            {menyimpan
              ? "Menyimpan jawaban…"
              : `${terjawab} dari ${data.questions.length} soal terjawab`}
          </p>
          <nav
            aria-label="Nomor soal"
            className="grid max-h-44 grid-cols-5 gap-2 overflow-y-auto lg:max-h-none"
          >
            {data.questions.map((q, i) =>
              filter !== "Semua" && q.category !== filter ? null : (
                <Button
                  key={q.id}
                  type="button"
                  variant={
                    i === indeks
                      ? "default"
                      : jawaban[q.id]
                        ? "secondary"
                        : "outline"
                  }
                  aria-current={i === indeks ? "step" : undefined}
                  aria-label={`Soal ${i + 1} ${q.category}${jawaban[q.id] ? ", terjawab" : ", belum dijawab"}`}
                  className="min-h-11"
                  onClick={() => setIndeks(i)}
                >
                  {i + 1}
                </Button>
              ),
            )}
          </nav>
          <Button
            disabled={menyimpan || mengakhiri || habis}
            onClick={() => setKonfirmasi(true)}
          >
            Selesaikan Tryout
          </Button>
        </aside>
        <fieldset
          disabled={menyimpan || mengakhiri || habis}
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <QuestionView
            question={soal}
            selectedAnswer={jawaban[soal.id]}
            hasPrev={indeks > 0}
            hasNext={indeks < data.questions.length - 1}
            onPrev={() => setIndeks((i) => Math.max(0, i - 1))}
            onNext={() =>
              setIndeks((i) => Math.min(data.questions.length - 1, i + 1))
            }
            onFinish={() => setKonfirmasi(true)}
            onSelectAnswer={(value, questionId = soal.id) => {
              const target = data.questions.find((q) => q.id === questionId);
              if (!target?.tryout_subtest_id || habis || sedangSelesai.current)
                return;
              const sebelumnya = jawaban[questionId];
              setJawaban((old) => ({ ...old, [questionId]: value }));
              setMenyimpan(true);
              setGalat("");
              pending.current = pending.current
                .then(() =>
                  SubmitAnswerHandler(
                    {
                      tryoutId: data.tryout.id,
                      subtestId: target.tryout_subtest_id!,
                      questionId,
                      answer: value,
                    },
                    token,
                  ),
                )
                .catch((error) => {
                  setJawaban((old) => ({ ...old, [questionId]: sebelumnya }));
                  setGalat(
                    getErrorMessage(
                      error,
                      "Jawaban belum tersimpan. Pilih kembali jawabanmu.",
                    ),
                  );
                })
                .finally(() => setMenyimpan(false));
            }}
          />
        </fieldset>
      </div>
      <Dialog
        open={konfirmasi}
        onOpenChange={(open) => {
          if (!mengakhiri) setKonfirmasi(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan seluruh tryout?</DialogTitle>
            <DialogDescription>
              Masih ada {data.questions.length - terjawab} soal belum dijawab.
              Setelah selesai, jawaban tidak bisa diubah.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              disabled={mengakhiri}
              onClick={() => setKonfirmasi(false)}
            >
              Periksa Lagi
            </Button>
            <Button disabled={mengakhiri} onClick={() => void selesai()}>
              {mengakhiri ? "Menyelesaikan…" : "Selesaikan Tryout"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UjianCpns({
  tryoutId,
  token,
}: {
  tryoutId: string;
  token: string;
}) {
  const router = useRouter();
  const cache = useQueryClient();
  const otomatis = useRef(false);
  const query = useQuery({
    queryKey: ["ujian-cpns", tryoutId],
    enabled: !!token,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    queryFn: async () =>
      (
        await api.get<{ data: DataUjian }>(`/tryouts/${tryoutId}/exam`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).data.data,
  });
  const expired =
    isAxiosError(query.error) &&
    query.error.response?.data?.data?.timer?.status === "expired";
  const selesaikanKadaluarsa = useCallback(async () => {
    try {
      await FinishTryoutHandler(tryoutId, token);
      await cache.invalidateQueries({ queryKey: ["get-tryout-result"], refetchType: "none" });
      router.replace(`/dashboard/try-out/${tryoutId}/result`);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Tryout gagal diselesaikan. Coba lagi."),
      );
    }
  }, [cache, router, token, tryoutId]);
  useEffect(() => {
    if (expired && !otomatis.current) {
      otomatis.current = true;
      void selesaikanKadaluarsa();
    }
  }, [expired, selesaikanKadaluarsa]);
  if (query.isPending)
    return (
      <p role="status" className="p-6">
        Memuat seluruh soal CPNS…
      </p>
    );
  if (query.isError)
    return (
      <div className="flex flex-col gap-4 p-6">
        <p role="alert">{getErrorMessage(query.error, "Soal gagal dimuat.")}</p>
        <Button
          className="self-start"
          onClick={() =>
            expired ? void selesaikanKadaluarsa() : void query.refetch()
          }
        >
          {expired ? "Lihat Hasil Tryout" : "Coba Lagi"}
        </Button>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => router.push(`/dashboard/try-out/${tryoutId}`)}
        >
          Kembali ke Tryout
        </Button>
      </div>
    );
  return <SoalCpns data={query.data} token={token} />;
}
