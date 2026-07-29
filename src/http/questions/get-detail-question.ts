import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Question } from "@/types/questions/question";

interface GetDetailQuestionResponse {
  data: Question;
}

export const GetDetailHandler = async (
  id: string,
  questionId: string,
  token: string,
): Promise<GetDetailQuestionResponse> => {
  const { data } = await api.get<GetDetailQuestionResponse>(
    `/admin/subtests/${id}/questions/${questionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetDetailQuestion = ({
  id,
  questionId,
  token,
  options,
}: {
  id: string;
  questionId: string;
  token: string;
  options?: Partial<UseQueryOptions<GetDetailQuestionResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-detail-question", id, questionId],
    queryFn: () => GetDetailHandler(id, questionId, token),
    enabled: !!token,
    ...options,
  });
};
