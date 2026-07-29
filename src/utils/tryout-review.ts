import type { ReviewQuestion } from "@/types/exam/exam";

export type TryoutLayoutMode = "attempt" | "review" | "admin-review";
export type ReviewQuestionStatus = "correct" | "incorrect" | "unanswered";
export type ReviewOptionState =
  | "correct_answer"
  | "user_wrong_answer"
  | "neutral";

export function getReviewQuestionStatus(
  question: ReviewQuestion,
): ReviewQuestionStatus {
  if (!question.my_answer) return "unanswered";
  if (question.question.question_type === "essay") {
    return question.is_correct ? "correct" : "incorrect";
  }
  if (!question.question.correct_answer) return "unanswered";

  return question.my_answer === question.question.correct_answer
    ? "correct"
    : "incorrect";
}

export function getReviewOptionState({
  optionKey,
  userAnswer,
  correctAnswer,
}: {
  optionKey: string;
  userAnswer?: string | null;
  correctAnswer?: string | null;
}): ReviewOptionState {
  if (!correctAnswer) return "neutral";
  if (correctAnswer && optionKey === correctAnswer) return "correct_answer";
  if (userAnswer && optionKey === userAnswer && userAnswer !== correctAnswer) {
    return "user_wrong_answer";
  }

  return "neutral";
}
