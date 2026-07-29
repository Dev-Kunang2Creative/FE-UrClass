import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { ExamData } from "@/types/exam/exam";

interface GetExamQuestionsResponse {
  data: ExamData;
}

export const GetExamQuestionsHandler = async (
  tryoutId: string,
  subtestId: string,
  token: string
): Promise<GetExamQuestionsResponse> => {
  const { data } = await api.get<GetExamQuestionsResponse>(
    `/tryouts/${tryoutId}/subtests/${subtestId}/exam`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useGetExamQuestions = ({
  tryoutId,
  subtestId,
  token,
  options,
}: {
  tryoutId: string;
  subtestId: string;
  token: string;
  options?: Partial<UseQueryOptions<GetExamQuestionsResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-exam-questions", tryoutId, subtestId],
    queryFn: () => GetExamQuestionsHandler(tryoutId, subtestId, token),
    enabled: !!tryoutId && !!subtestId && !!token,
    refetchOnWindowFocus: false,
    ...options,
  });
};
