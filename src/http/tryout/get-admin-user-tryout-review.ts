import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { ReviewData } from "@/types/exam/exam";

interface GetAdminUserTryoutReviewResponse {
  data: ReviewData;
}

export const GetAdminUserTryoutReviewHandler = async (
  tryoutId: string,
  userId: string,
  token: string,
  attempt?: number,
): Promise<GetAdminUserTryoutReviewResponse> => {
  // TODO: Adjust the endpoint to match the actual backend route if it's different.
  const { data } = await api.get<GetAdminUserTryoutReviewResponse>(
    `/admin/tryouts/${tryoutId}/users/${userId}/review`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: attempt ? { attempt } : undefined,
    },
  );
  return data;
};

export const useGetAdminUserTryoutReview = ({
  tryoutId,
  userId,
  token,
  attempt,
  options,
}: {
  tryoutId: string;
  userId: string;
  token: string;
  attempt?: number;
  options?: Partial<
    UseQueryOptions<GetAdminUserTryoutReviewResponse, AxiosError>
  >;
}) => {
  return useQuery({
    queryKey: ["get-admin-user-tryout-review", tryoutId, userId, attempt],
    queryFn: () =>
      GetAdminUserTryoutReviewHandler(tryoutId, userId, token, attempt),
    enabled: !!tryoutId && !!userId && !!token,
    ...options,
  });
};
