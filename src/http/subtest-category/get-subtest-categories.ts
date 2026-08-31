import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { SubtestCategory } from "@/types/subtest-category/subtest-category";

export interface GetSubtestCategoriesResponse {
  data: SubtestCategory[];
}

export const GetSubtestCategoriesHandler = async ({
  token,
  examType,
}: {
  token?: string;
  examType?: string;
}): Promise<GetSubtestCategoriesResponse> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = examType ? { exam_type: examType } : {};

  const { data } = await api.get<GetSubtestCategoriesResponse>(
    "/subtest-categories",
    {
      headers,
      params,
    },
  );

  return data;
};

export const useGetSubtestCategories = ({
  token,
  examType,
  options,
}: {
  token?: string;
  examType?: string;
  options?: Partial<
    UseQueryOptions<GetSubtestCategoriesResponse, AxiosError>
  >;
} = {}) => {
  return useQuery({
    queryKey: ["get-subtest-categories", examType, token],
    queryFn: () => GetSubtestCategoriesHandler({ token, examType }),
    ...options,
  });
};
