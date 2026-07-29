import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Subtest } from "@/types/subtest/subtest";

interface GetDetailSubtestResponse {
  data: Subtest;
}

export const GetDetailSubtestHandler = async (
  id: string,
  token: string,
): Promise<GetDetailSubtestResponse> => {
  const { data } = await api.get<GetDetailSubtestResponse>(
    `/admin/subtests/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetDetailSubtest = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetDetailSubtestResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-detail-subtest", id],
    queryFn: () => GetDetailSubtestHandler(id, token),
    enabled: !!token && !!id,
    ...options,
  });
};
