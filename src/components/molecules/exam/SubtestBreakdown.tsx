"use client";

import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { useKategori } from "@/hooks/useKategori";
import { findSubtestMeta } from "@/lib/kategori";
import type { TryoutResultData } from "@/types/exam/exam";

type PerSubtest = NonNullable<TryoutResultData["per_subtest"]>[number];

interface SubtestBreakdownProps {
  perSubtest?: PerSubtest[];
}

/**
 * Per-subtest scores, framed the way each track is actually judged.
 *
 * CPNS is a threshold exam: TWK, TIU and TKP each have a passing grade, and
 * one subtest below its own threshold fails the entire SKD no matter how high
 * the others are. So every row carries a verdict, and the overall verdict is a
 * conjunction rather than an average - reporting "score 320" without saying TIU
 * came in under 80 hides the only number that decided the outcome.
 *
 * UTBK has no threshold at all, only a rank. Rows show progress against the
 * maximum and deliberately carry no pass/fail language, because inventing one
 * would be misinformation.
 */
export default function SubtestBreakdown({ perSubtest }: SubtestBreakdownProps) {
  const { kategori } = useKategori();

  if (!perSubtest?.length) return null;

  const rows = perSubtest.map((s) => {
    const meta = findSubtestMeta(kategori, s.name);

    // Passing Grade SKD adalah angka mutlak terhadap ujian penuh: 65 dari 150
    // untuk TWK, 80 dari 175 untuk TIU, 166 dari 225 untuk TKP. Tryout yang
    // soalnya belum lengkap punya skor maksimum lebih kecil, sehingga ambang
    // itu tidak akan pernah tercapai - memvonis "tidak lulus" di sana adalah
    // vonis atas jumlah soalnya, bukan atas peserta.
    const fullScale =
      meta?.maxScore === undefined || s.max_score >= meta.maxScore;
    const threshold = fullScale ? meta?.passingGrade : undefined;

    // Undefined, not false, when there is no threshold: "no verdict" and
    // "failed" must never collapse into the same thing.
    const passed = threshold === undefined ? undefined : s.raw_score >= threshold;
    return { ...s, code: meta?.code, threshold, passed, fullScale };
  });

  const graded = rows.filter((r) => r.passed !== undefined);
  const shortened = rows.filter(
    (r) => !r.fullScale && findSubtestMeta(kategori, r.name)?.passingGrade !== undefined,
  );
  const allPassed = graded.length > 0 && graded.every((r) => r.passed);
  const failedRows = graded.filter((r) => !r.passed);

  return (
    <div className="mb-6 rounded-3xl border-2 border-slate-900 bg-white p-5 sm:p-6 shadow-[5px_5px_0px_0px_#0f172a]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Rincian per Subtest
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {graded.length > 0
              ? "Setiap subtest punya ambang sendiri yang wajib dilampaui."
              : "Tidak ada ambang minimum per subtest — yang dinilai skor akhir."}
          </p>

          {shortened.length > 0 && (
            <p className="mt-1 text-xs font-medium text-amber-700">
              Tryout ini belum berisi soal selengkap SKD resmi, jadi Passing
              Grade tidak diberlakukan pada{" "}
              {shortened.map((r) => r.code ?? r.name).join(", ")}.
            </p>
          )}
        </div>

        {graded.length > 0 && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-900 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] ${
              allPassed
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {allPassed ? (
              <CheckCircle2 className="size-4 text-emerald-700" />
            ) : (
              <XCircle className="size-4 text-rose-700" />
            )}
            {allPassed ? "Semua ambang terlampaui" : "Belum lolos ambang"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((r) => {
          const pct = r.max_score > 0 ? (r.raw_score / r.max_score) * 100 : 0;
          const thresholdPct =
            r.threshold !== undefined && r.max_score > 0
              ? (r.threshold / r.max_score) * 100
              : null;

          return (
            <div key={r.subtest_id} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-bold text-slate-800">
                  {r.code ? (
                    <span className="mr-1.5 rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-700 shadow-2xs">
                      {r.code}
                    </span>
                  ) : null}
                  {r.name}
                </p>
                <p className="shrink-0 text-sm font-black text-slate-900">
                  {r.raw_score}
                  <span className="text-xs font-semibold text-slate-400">
                    {" "}
                    / {r.max_score}
                  </span>
                </p>
              </div>

              <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-200/70">
                <div
                  className={`h-full rounded-full transition-all ${
                    r.passed === undefined
                      ? "bg-primary"
                      : r.passed
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
                {/* The threshold marker sits on the same axis as the bar, so
                    "how far off am I" is readable without arithmetic. */}
                {thresholdPct !== null && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-slate-900"
                    style={{ left: `${Math.min(100, thresholdPct)}%` }}
                    aria-hidden
                  />
                )}
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-500 font-medium">
                  {r.correct} benar dari {r.answered} terjawab
                  {r.total_questions ? ` · ${r.total_questions} soal` : ""}
                </span>
                {r.threshold !== undefined ? (
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      r.passed ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {r.passed ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <XCircle className="size-3.5" />
                    )}
                    ambang {r.threshold}
                    {!r.passed && (
                      <span className="font-semibold">
                        {" "}
                        (kurang {Math.max(0, r.threshold - r.raw_score)})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                    <MinusCircle className="size-3.5" />
                    tanpa ambang
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {failedRows.length > 0 && (
        <p className="mt-4 rounded-2xl border-2 border-slate-900 bg-rose-50 p-3.5 text-xs font-medium leading-snug text-rose-900 shadow-[2px_2px_0px_0px_#0f172a]">
          <strong>
            {failedRows.map((r) => r.code ?? r.name).join(", ")}
          </strong>{" "}
          masih di bawah ambang. Dalam SKD, satu subtest yang tidak mencapai
          ambang membuat keseluruhan tidak lulus — seberapa pun tinggi subtest
          lainnya.
        </p>
      )}
    </div>
  );
}
