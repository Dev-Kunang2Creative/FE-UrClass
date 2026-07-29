import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { TryoutResultData } from "@/types/exam/exam";

interface GetTryoutResultResponse {
  message: string;
  data: TryoutResultData;
}

export const GetTryoutResultHandler = async (
  tryoutId: string,
  token: string,
  attempt?: number
): Promise<GetTryoutResultResponse> => {
  const { data } = await api.get<GetTryoutResultResponse>(
    `/tryouts/${tryoutId}/result`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: attempt ? { attempt } : undefined,
    }
  );
  return data;
};

export const useGetTryoutResult = ({
  tryoutId,
  token,
  attempt,
  options,
}: {
  tryoutId: string;
  token: string;
  attempt?: number;
  options?: Partial<UseQueryOptions<GetTryoutResultResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-tryout-result", tryoutId, attempt],
    queryFn: () => GetTryoutResultHandler(tryoutId, token, attempt),
    enabled: !!tryoutId && !!token,
    ...options,
  });
};
