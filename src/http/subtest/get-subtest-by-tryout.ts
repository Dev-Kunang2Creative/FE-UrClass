import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { SubtestByTryout } from "@/types/subtest/subtest";

interface SubtestResponse {
  data: SubtestByTryout[];
}

export const GetSubtestByTryoutHandler = async (
  id: string,
  token: string,
): Promise<SubtestResponse> => {
  const { data } = await api.get<SubtestResponse>(
    `/admin/tryouts/${id}/subtests`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetSubtestByTryout = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<SubtestResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-subtest-by-tryout", id],
    queryFn: () => GetSubtestByTryoutHandler(id, token),
    enabled: !!token,
    ...options,
  });
};
