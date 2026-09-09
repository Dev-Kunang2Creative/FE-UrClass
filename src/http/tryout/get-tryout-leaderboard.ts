import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { TryoutLeaderboardData } from "@/types/exam/exam";

interface GetTryoutLeaderboardResponse {
  data: TryoutLeaderboardData;
}

export const GetTryoutLeaderboardHandler = async (
  tryoutId: string,
  token: string,
  targetInstance?: string,
): Promise<GetTryoutLeaderboardResponse> => {
  const { data } = await api.get<GetTryoutLeaderboardResponse>(
    `/tryouts/${tryoutId}/leaderboard`,
    { params: { target_instance: targetInstance || undefined }, headers: { Authorization: `Bearer ${token}` } },
  );

  return data;
};

export const useGetTryoutLeaderboard = ({
  tryoutId,
  token,
  options,
  targetInstance,
}: {
  tryoutId: string;
  token: string;
  targetInstance?: string;
  options?: Partial<UseQueryOptions<GetTryoutLeaderboardResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-tryout-leaderboard", tryoutId, token, targetInstance],
    queryFn: () => GetTryoutLeaderboardHandler(tryoutId, token, targetInstance),
    enabled: !!tryoutId && !!token,
    ...options,
  });
};
