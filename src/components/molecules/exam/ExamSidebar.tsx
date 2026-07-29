"use client";

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
  return (
    <div className="w-full lg:w-65 shrink-0 flex flex-col gap-4">
      <div className="bg-[#002B66] text-white rounded-xl p-4 text-center">
        <p className="text-sm font-medium opacity-80">Subtest:</p>
        <h3 className="font-bold text-base whitespace-pre-line">
          {subtestName}
        </h3>
      </div>

      <div className="border-2 border-[#004AAB]/20 rounded-xl p-4">
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
                    ? "bg-[#004AAB] text-white ring-2 ring-[#004AAB] ring-offset-2"
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
          className="w-full bg-[#004AAB] hover:bg-[#003B8A] text-white py-3 rounded-xl font-bold text-sm transition-colors"
        >
          Akhiri Subtest
        </button>
      ) : (
        <div className="w-full bg-blue-50 border border-blue-100 text-[#004AAB] py-3 rounded-xl font-bold text-sm text-center">
          {mode === "admin-review" ? "Mode Review (Admin)" : "Mode Review"}
        </div>
      )}
    </div>
  );
}
