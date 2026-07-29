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
): Promise<GetTryoutLeaderboardResponse> => {
  const { data } = await api.get<GetTryoutLeaderboardResponse>(
    `/tryouts/${tryoutId}/leaderboard`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return data;
};

export const useGetTryoutLeaderboard = ({
  tryoutId,
  token,
  options,
}: {
  tryoutId: string;
  token: string;
  options?: Partial<UseQueryOptions<GetTryoutLeaderboardResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-tryout-leaderboard", tryoutId],
    queryFn: () => GetTryoutLeaderboardHandler(tryoutId, token),
    enabled: !!tryoutId && !!token,
    ...options,
  });
};
