import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface SubmitAnswerResponse {
  message: string;
  data: {
    question_id: string;
    answer: string | null;
  };
}

interface SubmitAnswerPayload {
  tryoutId: string;
  subtestId: string;
  questionId: string;
  answer: string | null; // A, B, C, D, E or null to clear
}

export const SubmitAnswerHandler = async (
  payload: SubmitAnswerPayload,
  token: string
): Promise<SubmitAnswerResponse> => {
  const { data } = await api.post<SubmitAnswerResponse>(
    `/tryouts/${payload.tryoutId}/subtests/${payload.subtestId}/questions/${payload.questionId}/answer`,
    { answer: payload.answer },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useSubmitAnswer = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<SubmitAnswerResponse, AxiosError, SubmitAnswerPayload>>;
}) => {
  return useMutation({
    mutationFn: (payload: SubmitAnswerPayload) => SubmitAnswerHandler(payload, token),
    ...options,
  });
};
