"use client";

import { useKategori } from "@/hooks/useKategori";
import { KATEGORI_CONFIG, findSubtestMeta } from "@/lib/kategori";
import type {
  ReviewQuestionStatus,
  TryoutLayoutMode,
} from "@/utils/tryout-review";

interface ExamSidebarProps {
  subtestName: string;
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<string>;
  questionIds: string[];
  onQuestionClick: (index: number) => void;
  onFinishSubtest?: () => void;
  mode?: TryoutLayoutMode;
  reviewStatuses?: Record<string, ReviewQuestionStatus>;
}

export default function ExamSidebar({
  subtestName,
  totalQuestions,
  currentIndex,
  answeredQuestions,
  questionIds,
  onQuestionClick,
  onFinishSubtest,
  mode = "attempt",
  reviewStatuses = {},
}: ExamSidebarProps) {
  const { kategori } = useKategori();
  const config = KATEGORI_CONFIG[kategori];
  const meta = findSubtestMeta(kategori, subtestName);

  const answeredCount = questionIds.filter((id) =>
    answeredQuestions.has(id),
  ).length;

  return (
    <div className="w-full lg:w-65 shrink-0 flex flex-col gap-4">
      {/* Colours come from --primary, which the track sets, so this needs no
          per-kategori branch. It used to hardcode blue and orange. */}
      <div className="bg-primary text-primary-foreground rounded-xl p-4 text-center">
        <p className="text-sm font-medium opacity-80">Subtest:</p>
        <h3 className="font-bold text-base whitespace-pre-line">
          {subtestName}
        </h3>
      </div>

      {/* The metric each track is actually judged on. A CPNS candidate needs
          the passing grade for this subtest; a UTBK candidate has no passing
          grade at all and is scored on the IRT scale. Showing the wrong one is
          worse than showing neither. */}
      {mode === "attempt" && (
        <div className="rounded-xl border-2 border-track-border bg-track-tint p-4">
          {meta?.passingGrade !== undefined ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary/70">
                Passing Grade {meta.code}
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-primary">
                  {meta.passingGrade}
                </span>
                <span className="text-xs font-semibold text-primary/60">
                  / {meta.maxScore}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-primary/70">
                Nilai di bawah ambang ini membuat keseluruhan SKD tidak lulus,
                seberapa pun tinggi subtest lain.
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary/70">
                Skala Penilaian
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-primary">
                  {config.maxScore}
                </span>
                <span className="text-xs font-semibold text-primary/60">
                  maks
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-primary/70">
                {config.scoreScale}. Tidak ada ambang minimum per subtest -
                yang dinilai skor akhir gabungan.
              </p>
            </>
          )}

          <div className="mt-3 border-t border-track-border pt-2">
            <p className="text-[11px] font-semibold text-primary/70">
              Terjawab {answeredCount} dari {totalQuestions}
            </p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="border-2 border-track-border rounded-xl p-4">
        <h4 className="font-bold text-sm text-gray-800 mb-3 text-center">
          Daftar Soal:
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const qId = questionIds[i];
            const isActive = i === currentIndex;
            const isAnswered = qId && answeredQuestions.has(qId);
            const reviewStatus = qId ? reviewStatuses[qId] : undefined;
            const isReviewMode = mode === "review" || mode === "admin-review";
            // Green and red stay literal: correct and incorrect mean the same
            // thing on both tracks, so they must not follow the palette.
            const buttonClass = isReviewMode
              ? reviewStatus === "correct"
                ? "bg-green-600 text-white border border-green-600"
                : reviewStatus === "incorrect"
                  ? "bg-red-600 text-white border border-red-600"
                  : "bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300"
              : isAnswered
                ? "bg-[#3B9245] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200";

            return (
              <button
                key={qId ?? i}
                onClick={() => onQuestionClick(i)}
                className={`w-full aspect-square rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2"
                    : buttonClass
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {mode === "attempt" ? (
        <button
          onClick={onFinishSubtest}
          className="w-full py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Akhiri Subtest
        </button>
      ) : (
        <div className="w-full py-3 rounded-xl font-bold text-sm text-center border border-track-border bg-track-tint text-primary">
          {mode === "admin-review" ? "Mode Review (Admin)" : "Mode Review"}
        </div>
      )}
    </div>
  );
}
