"use client";

import {
  useState,
  useEffect,
  use,
  Suspense,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { AxiosError } from "axios";
import { X } from "lucide-react";
import { toast } from "sonner";
import ExamTimer from "@/components/molecules/exam/ExamTimer";
import ExamSidebar from "@/components/molecules/exam/ExamSidebar";
import QuestionView from "@/components/molecules/exam/QuestionView";
import DialogFinishSubtest from "@/components/molecules/dialog/DialogFinishSubtest";
import DialogExitExam from "@/components/molecules/dialog/DialogExitExam";
import DialogTimeUp from "@/components/molecules/dialog/DialogTimeUp";
import { useSubmitAnswer } from "@/http/tryout/submit-answer";
import { useFinishSubtest } from "@/http/tryout/finish-subtest";
import { useStartSubtest } from "@/http/tryout/start-subtest";
import { useGetExamQuestions } from "@/http/tryout/get-exam-questions";
import { useGetUserTryoutDetail } from "@/http/tryout/get-user-tryout-detail";
import { getErrorMessage } from "@/utils/get-error-message";
import type { ExamQuestion } from "@/types/exam/exam";
import type { SubtestByTryout } from "@/types/subtest/subtest";

interface SubtestInfo {
  id: string;
  name: string;
  category: string;
  duration: number;
  questionCount: number;
}

function ExamContent({ tryoutId }: { tryoutId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const token = session?.access_token || "";

  // Read subtest index from query param
  const subtestParam = parseInt(searchParams.get("subtest") || "0", 10);

  // State
  const [currentSubtestIndex] = useState(subtestParam);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Guard so the time-up / auto-submit flow only runs once per subtest.
  const timeUpHandledRef = useRef(false);
  // Holds the latest auto-submit handler so the load effect can call it
  // without depending on its (changing) identity.
  const autoSubmitRef = useRef<() => void>(() => {});

  // Fetch tryout detail to get subtests list
  const { data: tryoutDetail } = useGetUserTryoutDetail({
    id: tryoutId,
    token,
  });

  const subtests = useMemo<SubtestInfo[]>(() => {
    if (!tryoutDetail?.data?.tryout_subtests) return [];

    return [...tryoutDetail.data.tryout_subtests]
      .sort((a: SubtestByTryout, b: SubtestByTryout) => a.order_no - b.order_no)
      .map((ts: SubtestByTryout) => {
        const rawName = ts.subtest.name;
        const displayName = rawName.includes("_")
          ? rawName.split("_").slice(1).join("_")
          : rawName;

        return {
          id: ts.id,
          name: displayName,
          category:
            ts.subtest.category === "TPS"
              ? "Tes Potensi Skolastik"
              : "Tes Literasi",
          duration: ts.duration_minutes,
          questionCount: ts.subtest.max_questions,
        };
      });
  }, [tryoutDetail]);

  const currentSubtest = subtests[currentSubtestIndex];
  const totalSubtests = subtests.length;

  // --- Backend: Start subtest & fetch questions ---
  const { mutate: startSubtest } = useStartSubtest({
    token,
    options: {
      onSuccess: (data) => {
        // Timer from BE
        setTimerSeconds(data.data.remaining_seconds);
      },
      onError: (error: unknown) => {
        console.error("Failed to start subtest:", error);
        // Fallback to configured duration
        setTimerSeconds((currentSubtest?.duration || 30) * 60);
      },
    },
  });

  // Backend: fetch exam questions
  const { refetch: refetchExam } = useGetExamQuestions({
    tryoutId,
    subtestId: currentSubtest?.id || "",
    token,
    options: {
      enabled: false, // Manual trigger
    },
  });

  // --- INIT: Load questions from backend ---
  useEffect(() => {
    if (!currentSubtest) return;

    queueMicrotask(() => {
      setIsLoading(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
    });

    // Fetch exam questions; detect an already-expired subtest so we can
    // auto-submit and advance instead of getting stuck on the loader.
    const loadExam = () => {
      refetchExam()
        .then((result) => {
          const data = result.data?.data;
          const questionsList = data?.questions;

          if (questionsList && questionsList.length > 0) {
            setQuestions(questionsList);
            // Pre-fill answers from BE (my_answer field)
            const preAnswers: Record<string, string | null> = {};
            questionsList.forEach((q) => {
              if (q.my_answer) preAnswers[q.id] = q.my_answer;
            });
            setAnswers(preAnswers);

            // Use timer from BE data if available
            if (data?.timer) {
              setTimerSeconds(data.timer.remaining_seconds);
            }
            setIsLoading(false);
            return;
          }

          // No questions returned — the subtest may already be expired.
          const errorBody = (
            result.error as AxiosError<{
              data?: {
                timer?: { remaining_seconds?: number; status?: string };
              };
            }> | null
          )?.response?.data;
          const isExpired =
            errorBody?.data?.timer?.status === "expired" ||
            errorBody?.data?.timer?.remaining_seconds === 0 ||
            data?.timer?.status === "expired" ||
            data?.timer?.remaining_seconds === 0;

          setIsLoading(false);

          if (isExpired) {
            // Time already ran out: auto-submit and move on.
            autoSubmitRef.current();
          } else {
            setQuestions([]);
          }
        })
        .catch(() => {
          setQuestions([]);
          setIsLoading(false);
        });
    };

    // Start the subtest session (to get timer), then fetch questions
    startSubtest(
      { tryoutId, subtestId: currentSubtest.id },
      {
        onSuccess: loadExam,
        // Fallback: still try to fetch (maybe subtest was already started)
        onError: loadExam,
      },
    );
  }, [currentSubtest, refetchExam, startSubtest, tryoutId]);

  // --- Mutations ---
  const submitAnswerMutation = useSubmitAnswer({
    token,
    options: {
      onError: (error: unknown) =>
        console.error("Failed to submit answer:", error),
    },
  });

  const { mutateAsync: finishSubtestAsync } = useFinishSubtest({
    token,
  });

  // --- Derived state ---
  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = new Set(
    Object.entries(answers)
      .filter(([, v]) => v !== null)
      .map(([k]) => k),
  );
  const unansweredCount = questions.length - answeredQuestions.size;

  // --- Handlers ---
  const handleSelectAnswer = (
    answer: string | null,
    questionId = currentQuestion?.id,
  ) => {
    if (!currentQuestion || !questionId) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    // Submit to API
    if (currentSubtest) {
      submitAnswerMutation.mutate({
        tryoutId,
        subtestId: currentSubtest.id,
        questionId,
        answer,
      });
    }
  };

  const navigateAfterSubtest = useCallback(() => {
    const nextIndex = currentSubtestIndex + 1;
    if (nextIndex < totalSubtests) {
      router.push(
        `/dashboard/try-out/${tryoutId}/subtest-complete?current=${currentSubtestIndex}&next=${nextIndex}&total=${totalSubtests}`,
      );
    } else {
      router.push(`/dashboard/try-out/${tryoutId}/tryout-complete`);
    }
  }, [currentSubtestIndex, totalSubtests, router, tryoutId]);

  // Auto-submit the current subtest and advance. Always navigates, even if the
  // finish request fails, because the backend already marks an expired subtest
  // on its own — otherwise the user would be stuck with the timer at 00:00.
  const autoSubmitAndAdvance = useCallback(async () => {
    if (timeUpHandledRef.current) return;
    timeUpHandledRef.current = true;
    setShowTimeUpDialog(false);

    const toastId = toast.loading("Menyimpan jawaban Anda...");
    try {
      if (currentSubtest) {
        await finishSubtestAsync({
          tryoutId,
          subtestId: currentSubtest.id,
        });
      }
      toast.success("Berhasil menyimpan jawaban!", { id: toastId });
    } catch {
      // Non-fatal: the subtest is already expired on the server.
      toast.dismiss(toastId);
    } finally {
      navigateAfterSubtest();
    }
  }, [currentSubtest, finishSubtestAsync, tryoutId, navigateAfterSubtest]);

  // Keep the ref pointing at the latest handler for the load effect.
  useEffect(() => {
    autoSubmitRef.current = autoSubmitAndAdvance;
  }, [autoSubmitAndAdvance]);

  const handleTimeUp = useCallback(() => {
    setShowTimeUpDialog(true);
  }, []);

  const handleFinishSubtest = () => {
    setShowFinishDialog(true);
  };

  const confirmFinishSubtest = async () => {
    setShowFinishDialog(false);
    if (currentSubtest) {
      const toastId = toast.loading("Menyimpan jawaban Anda...");
      try {
        await finishSubtestAsync({
          tryoutId,
          subtestId: currentSubtest.id,
        });
        toast.success("Berhasil menyimpan jawaban!", { id: toastId });
        navigateAfterSubtest();
      } catch (err) {
        toast.error(getErrorMessage(err, "Gagal menyimpan jawaban"), {
          id: toastId,
        });
      }
    } else {
      navigateAfterSubtest();
    }
  };

  const handleExitExam = () => {
    setShowExitDialog(true);
  };

  const confirmExitExam = () => {
    setShowExitDialog(false);
    router.push(`/dashboard/try-out/${tryoutId}`);
  };

  // --- Render ---
  if (isLoading || !currentQuestion || !currentSubtest) {
    return (
      <div className="fixed inset-0 z-40 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004AAB] mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat soal subtest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={handleExitExam}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="font-bold text-sm hidden sm:inline">
            Judul Try Out
          </span>
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-500">Nomor Soal</p>
          <p className="font-bold text-lg text-gray-900">
            {currentQuestionIndex + 1}
          </p>
        </div>
        <ExamTimer remainingSeconds={timerSeconds} onTimeUp={handleTimeUp} />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className="w-full lg:w-auto lg:border-r lg:border-gray-100 p-4 lg:overflow-y-auto bg-gray-50/50 shrink-0">
          <ExamSidebar
            subtestName={`${currentSubtest.category}:\n${currentSubtest.name}`}
            totalQuestions={questions.length}
            currentIndex={currentQuestionIndex}
            answeredQuestions={answeredQuestions}
            questionIds={questions.map((q) => q.id)}
            onQuestionClick={(i) => setCurrentQuestionIndex(i)}
            onFinishSubtest={handleFinishSubtest}
          />
        </div>

        {/* Question Area */}
        <QuestionView
          question={currentQuestion}
          selectedAnswer={
            answers[currentQuestion.id] ?? currentQuestion.my_answer
          }
          onSelectAnswer={handleSelectAnswer}
          onPrev={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          onNext={() =>
            setCurrentQuestionIndex((prev) =>
              Math.min(questions.length - 1, prev + 1),
            )
          }
          onFinish={handleFinishSubtest}
          hasPrev={currentQuestionIndex > 0}
          hasNext={currentQuestionIndex < questions.length - 1}
        />
      </div>

      {/* Finish Subtest Dialog */}
      <DialogFinishSubtest
        open={showFinishDialog}
        onOpenChange={setShowFinishDialog}
        unansweredCount={unansweredCount}
        onConfirm={confirmFinishSubtest}
      />

      {/* Exit Exam Dialog */}
      <DialogExitExam
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onConfirm={confirmExitExam}
      />

      {/* Time Up Dialog */}
      <DialogTimeUp
        open={showTimeUpDialog}
        onOpenChange={setShowTimeUpDialog}
        onConfirm={autoSubmitAndAdvance}
      />
    </div>
  );
}

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tryoutId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004AAB]" />
        </div>
      }
    >
      <ExamContent tryoutId={tryoutId} />
    </Suspense>
  );
}
