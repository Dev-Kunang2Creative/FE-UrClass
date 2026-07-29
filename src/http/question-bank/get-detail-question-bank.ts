import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { QuestionBank } from "@/types/question-bank/question-bank";

interface GetDetailQuestionBankResponse {
  data: QuestionBank;
}

export const GetDetailQuestionBankHandler = async (
  id: string,
  token: string,
): Promise<GetDetailQuestionBankResponse> => {
  const { data } = await api.get<GetDetailQuestionBankResponse>(
    `/admin/question-bank/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetDetailQuestionBank = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetDetailQuestionBankResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-detail-question-bank", id],
    queryFn: () => GetDetailQuestionBankHandler(id, token),
    enabled: !!token,
    ...options,
  });
};
