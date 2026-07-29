import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { QuestionBank } from "@/types/question-bank/question-bank";

interface GetAllQuestionBankResponse {
  data: QuestionBank[];
}

export const GetAllQuestionBankHandler = async (
  token: string,
): Promise<GetAllQuestionBankResponse> => {
  const { data } = await api.get<GetAllQuestionBankResponse>(
    "/admin/question-bank",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetAllQuestionBank = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<GetAllQuestionBankResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-all-question-bank"],
    queryFn: () => GetAllQuestionBankHandler(token),
    enabled: !!token,
    ...options,
  });
};
