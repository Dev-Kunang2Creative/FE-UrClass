"use client";

import { useKategori } from "@/hooks/useKategori";
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
  const isCpns = kategori === "cpns";

  return (
    <div className="w-full lg:w-65 shrink-0 flex flex-col gap-4">
      <div
        className={`text-white rounded-xl p-4 text-center ${
          isCpns ? "bg-amber-900" : "bg-[#1E3A8A]"
        }`}
      >
        <p className="text-sm font-medium opacity-80">Subtest:</p>
        <h3 className="font-bold text-base whitespace-pre-line">
          {subtestName}
        </h3>
      </div>

      <div
        className={`border-2 rounded-xl p-4 ${
          isCpns ? "border-amber-600/20" : "border-blue-600/20"
        }`}
      >
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
                    ? isCpns
                      ? "bg-amber-700 text-white ring-2 ring-amber-700 ring-offset-2"
                      : "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
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
          className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-colors ${
            isCpns
              ? "bg-amber-700 hover:bg-amber-800"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Akhiri Subtest
        </button>
      ) : (
        <div
          className={`w-full py-3 rounded-xl font-bold text-sm text-center border ${
            isCpns
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-blue-50 border-blue-100 text-blue-600"
          }`}
        >
          {mode === "admin-review" ? "Mode Review (Admin)" : "Mode Review"}
        </div>
      )}
    </div>
  );
}
