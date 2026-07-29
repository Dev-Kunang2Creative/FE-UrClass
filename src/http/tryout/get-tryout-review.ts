import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { ReviewData } from "@/types/exam/exam";

interface GetTryoutReviewResponse {
  data: ReviewData;
}

export const GetTryoutReviewHandler = async (
  tryoutId: string,
  token: string,
  attempt?: number
): Promise<GetTryoutReviewResponse> => {
  const { data } = await api.get<GetTryoutReviewResponse>(
    `/tryouts/${tryoutId}/review`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: attempt ? { attempt } : undefined,
    }
  );
  return data;
};

export const useGetTryoutReview = ({
  tryoutId,
  token,
  attempt,
  options,
}: {
  tryoutId: string;
  token: string;
  attempt?: number;
  options?: Partial<UseQueryOptions<GetTryoutReviewResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-tryout-review", tryoutId, attempt],
    queryFn: () => GetTryoutReviewHandler(tryoutId, token, attempt),
    enabled: !!tryoutId && !!token,
    ...options,
  });
};
