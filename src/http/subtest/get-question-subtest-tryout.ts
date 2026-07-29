import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { QuestionBankBySubtestTryout } from "@/types/question-bank/question-bank";

interface SubtestResponse {
  data: QuestionBankBySubtestTryout[];
}

export const GetQuestionSubtestTryoutHandler = async (
  tryoutId: string,
  subtestId: string,
  token: string,
): Promise<SubtestResponse> => {
  const { data } = await api.get<SubtestResponse>(
    `/admin/tryouts/${tryoutId}/subtests/${subtestId}/bank-questions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetQuestionSubtestTryout = ({
  tryoutId,
  subtestId,
  token,
  options,
}: {
  tryoutId: string;
  subtestId: string;
  token: string;
  options?: Partial<UseQueryOptions<SubtestResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-question-subtest-by-tryout", tryoutId, subtestId],
    queryFn: () => GetQuestionSubtestTryoutHandler(tryoutId, subtestId, token),
    enabled: !!token,
    ...options,
  });
};
