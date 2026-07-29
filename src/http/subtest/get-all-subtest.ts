import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Subtest } from "@/types/subtest/subtest";

interface SubtestResponse {
  data: Subtest[];
}

export const getAllSubtestHandler = async (
  token: string,
): Promise<SubtestResponse> => {
  const { data } = await api.get<SubtestResponse>("/subtests", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useGetAllSubtest = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<SubtestResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-all-subtests"],
    queryFn: () => getAllSubtestHandler(token),
    enabled: !!token,
    ...options,
  });
};
