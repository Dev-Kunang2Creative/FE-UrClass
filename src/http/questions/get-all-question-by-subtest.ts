import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Question } from "@/types/questions/question";

interface GetAllQuestionBySubtestResponse {
  data: Question[];
}

export const GetAllQuestionBySubtestHandler = async (
  id: string,
  token: string,
): Promise<GetAllQuestionBySubtestResponse> => {
  const { data } = await api.get<GetAllQuestionBySubtestResponse>(
    `/admin/subtests/${id}/questions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetAllQuestionBySubtest = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<
    UseQueryOptions<GetAllQuestionBySubtestResponse, AxiosError>
  >;
}) => {
  return useQuery({
    queryKey: ["get-all-question-by-subtest", id],
    queryFn: () => GetAllQuestionBySubtestHandler(id, token),
    enabled: !!token,
    ...options,
  });
};
