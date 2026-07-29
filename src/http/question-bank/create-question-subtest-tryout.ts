import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { ErrorResponse } from "@/types/metadata/metadata";
import { QuestionBankBySubtestTryout } from "@/types/question-bank/question-bank";
import { QuestionSubtestTryoutType } from "@/validators/question-bank/question-subtest-tryout";

interface CreateQuestionSubtestTryoutResponse {
  data: QuestionBankBySubtestTryout;
}

export const CreateQuestionSubtestTryoutHandler = async (
  tryoutId: string,
  tryoutSubtestId: string,
  body: QuestionSubtestTryoutType,
  token: string,
) => {
  const { data } = await api.post(
    `/admin/tryouts/${tryoutId}/subtests/${tryoutSubtestId}/bank-questions`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};

export const useCreateQuestionSubtestTryout = (
  options?: UseMutationOptions<
    CreateQuestionSubtestTryoutResponse,
    AxiosError<ErrorResponse>,
    {
      tryoutId: string;
      tryoutSubtestId: string;
      body: QuestionSubtestTryoutType;
    }
  >,
) => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: ({ tryoutId, tryoutSubtestId, body }) =>
      CreateQuestionSubtestTryoutHandler(
        tryoutId,
        tryoutSubtestId,
        body,
        session?.access_token ?? "",
      ),
    ...options,
  });
};
