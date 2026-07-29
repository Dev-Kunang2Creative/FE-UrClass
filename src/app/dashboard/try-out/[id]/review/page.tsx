"use client";

import { use, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import ExamSidebar from "@/components/molecules/exam/ExamSidebar";
import QuestionView from "@/components/molecules/exam/QuestionView";
import { useGetTryoutReview } from "@/http/tryout/get-tryout-review";
import { useUnlockDiscussion } from "@/http/tryout/unlock-discussion";
import type { ExamQuestion, ReviewQuestion } from "@/types/exam/exam";
import { getReviewQuestionStatus } from "@/utils/tryout-review";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import DialogUnlockDiscussion from "@/components/molecules/dialog/DialogUnlockDiscussion";
import { useTickets } from "@/hooks/useTickets";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const attempt = Number(searchParams.get("attempt") || 0) || undefined;
  const attemptQuery = attempt ? `?attempt=${attempt}` : "";
  const { data: session } = useSession();
  const token = session?.access_token || "";
  const [selectedSubtestId, setSelectedSubtestId] = useState<string>("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const { ticketCount } = useTickets();

  const { data: beReview, isError, isLoading, refetch } = useGetTryoutReview({
    tryoutId,
    token,
    attempt,
  });

  const unlockMutation = useUnlockDiscussion({
    token,
    options: {
      onSuccess: (data) => {
        toast.success(data.message);
        setIsUnlockDialogOpen(false);
        refetch();
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Gagal membuka pembahasan"));
      },
    },
  });

  const handleUnlock = () => {
    unlockMutation.mutate({ tryoutId });
  };

  const reviewItems = useMemo(() => beReview?.data?.review ?? [], [beReview]);
  const isLocked = useMemo(() => {
    return reviewItems.some(item => item.question.discussion === '(Gunakan 1 Tiket untuk pembahasan)');
  }, [reviewItems]);
  const subtests = useMemo(() => {
    const map = new Map<string, string>();
    reviewItems.forEach((item) => {
      const rawName = item.subtest.name;
      const displayName = rawName.includes("_") ? rawName.split("_").slice(1).join("_") : rawName;
      map.set(item.subtest.id, displayName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [reviewItems]);

  const filteredItems = useMemo(() => {
    if (selectedSubtestId === "all") return reviewItems;
    return reviewItems.filter((item) => item.subtest.id === selectedSubtestId);
  }, [reviewItems, selectedSubtestId]);

  const questions = useMemo(() => filteredItems.map(mapReviewQuestionToExamQuestion), [filteredItems]);
  const reviewStatuses = useMemo(() => {
    return filteredItems.reduce<Record<string, ReturnType<typeof getReviewQuestionStatus>>>(
      (acc, item) => {
        acc[item.question_id] = getReviewQuestionStatus(item);
        return acc;
      },
      {},
    );
  }, [filteredItems]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentReviewItem = filteredItems[currentQuestionIndex];
  const selectedSubtestName =
    selectedSubtestId === "all"
      ? "Semua Subtest"
      : subtests.find((subtest) => subtest.id === selectedSubtestId)?.name ?? "Subtest";

  const handleSelectSubtest = (subtestId: string) => {
    setSelectedSubtestId(subtestId);
    setCurrentQuestionIndex(0);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-40 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004AAB] mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Memuat pembahasan try out...</p>
        </div>
      </div>
    );
  }

  if (isError || reviewItems.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Pembahasan belum tersedia</h1>
          <p className="text-sm text-gray-500 mb-5">
            Kamu belum mengerjakan Try Out ini, sehingga pembahasan belum tersedia.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/try-out/${tryoutId}`)}
            className="rounded-full bg-[#004AAB] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003B8A]"
          >
            Kembali ke Detail Try Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/try-out/${tryoutId}/result${attemptQuery}`)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="font-bold text-sm hidden sm:inline">
            {beReview?.data?.tryout_title ?? "Lihat Pembahasan"}
          </span>
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-500">Nomor Soal</p>
          <p className="font-bold text-lg text-gray-900">{currentQuestionIndex + 1}</p>
        </div>
        <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-[#004AAB]">
          Mode Review
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
        <aside className="w-full lg:w-auto lg:border-r lg:border-gray-100 p-4 lg:overflow-y-auto bg-gray-50/50 shrink-0">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:w-65 lg:flex-col lg:overflow-visible lg:pb-0">
            <button
              type="button"
              onClick={() => handleSelectSubtest("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                selectedSubtestId === "all"
                  ? "bg-[#004AAB] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              Semua ({reviewItems.length})
            </button>
            {subtests.map((subtest) => (
              <button
                key={subtest.id}
                type="button"
                onClick={() => handleSelectSubtest(subtest.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors lg:text-left ${
                  selectedSubtestId === subtest.id
                    ? "bg-[#004AAB] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {subtest.name} ({reviewItems.filter((item) => item.subtest.id === subtest.id).length})
              </button>
            ))}
          </div>

          <ExamSidebar
            subtestName={selectedSubtestName}
            totalQuestions={questions.length}
            currentIndex={currentQuestionIndex}
            answeredQuestions={
              new Set(filteredItems.filter((item) => item.my_answer).map((item) => item.question_id))
            }
            questionIds={questions.map((question) => question.id)}
            onQuestionClick={(index) => setCurrentQuestionIndex(index)}
            mode="review"
            reviewStatuses={reviewStatuses}
          />

          {isLocked && (
            <button
              type="button"
              onClick={() => setIsUnlockDialogOpen(true)}
              className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#b45309] transition-all hover:bg-amber-600 active:translate-y-1 active:shadow-none disabled:opacity-50 lg:w-65"
            >
              🔓 Buka Semua Pembahasan
            </button>
          )}
        </aside>

        <QuestionView
          question={currentQuestion}
          selectedAnswer={currentReviewItem?.my_answer ?? null}
          onSelectAnswer={() => undefined}
          onPrev={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          onNext={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          onFinish={() => router.push(`/dashboard/try-out/${tryoutId}/result${attemptQuery}`)}
          hasPrev={currentQuestionIndex > 0}
          hasNext={currentQuestionIndex < questions.length - 1}
          mode="review"
        />
      </div>

      <DialogUnlockDiscussion
        open={isUnlockDialogOpen}
        onOpenChange={setIsUnlockDialogOpen}
        onConfirm={handleUnlock}
        ticketCount={ticketCount || 0}
        isPending={unlockMutation.isPending}
      />
    </div>
  );
}

function mapReviewQuestionToExamQuestion(item: ReviewQuestion): ExamQuestion {
  return {
    id: item.question.id,
    question_type: item.question.question_type,
    question_text: item.question.question_text,
    question_image: item.question.question_image,
    question_image_url: item.question.question_image_url,
    order_no: 0,
    options: item.question.options,
    my_answer: item.my_answer,
    correct_answer: item.question.correct_answer,
    discussion: item.question.discussion,
    discussion_image_url: item.question.discussion_image_url,
  };
}
