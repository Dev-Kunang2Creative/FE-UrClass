import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { SubtestCategory } from "@/types/subtest-category/subtest-category";

export interface AdminSubtestCategoryBody {
  code: string;
  name: string;
  exam_type: "utbk" | "cpns";
  is_active?: boolean;
}

export interface GetAdminSubtestCategoriesResponse {
  data: SubtestCategory[];
}

export const GetAdminSubtestCategoriesHandler = async ({
  token,
  examType,
}: {
  token: string;
  examType?: string;
}): Promise<GetAdminSubtestCategoriesResponse> => {
  const { data } = await api.get<GetAdminSubtestCategoriesResponse>(
    "/admin/subtest-categories",
    {
      headers: { Authorization: `Bearer ${token}` },
      params: examType ? { exam_type: examType } : {},
    },
  );

  return data;
};

export const useGetAdminSubtestCategories = ({
  token,
  examType,
  options,
}: {
  token: string;
  examType?: string;
  options?: Partial<
    UseQueryOptions<GetAdminSubtestCategoriesResponse, AxiosError>
  >;
}) => {
  return useQuery({
    queryKey: ["get-admin-subtest-categories", examType, token],
    queryFn: () => GetAdminSubtestCategoriesHandler({ token, examType }),
    enabled: !!token,
    ...options,
  });
};

export const useCreateSubtestCategory = ({
  token,
  onSuccess,
  onError,
}: {
  token: string;
  onSuccess?: (data: { message: string; data: SubtestCategory }) => void;
  onError?: (error: AxiosError<{ message?: string }>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: AdminSubtestCategoryBody) => {
      const { data } = await api.post<{ message: string; data: SubtestCategory }>(
        "/admin/subtest-categories",
        body,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-admin-subtest-categories"] });
      queryClient.invalidateQueries({ queryKey: ["get-subtest-categories"] });
      onSuccess?.(data);
    },
    onError,
  });
};

export const useUpdateSubtestCategory = ({
  token,
  onSuccess,
  onError,
}: {
  token: string;
  onSuccess?: (data: { message: string; data: SubtestCategory }) => void;
  onError?: (error: AxiosError<{ message?: string }>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: AdminSubtestCategoryBody;
    }) => {
      const { data } = await api.put<{ message: string; data: SubtestCategory }>(
        `/admin/subtest-categories/${id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-admin-subtest-categories"] });
      queryClient.invalidateQueries({ queryKey: ["get-subtest-categories"] });
      onSuccess?.(data);
    },
    onError,
  });
};

export const useToggleActiveSubtestCategory = ({
  token,
  onSuccess,
  onError,
}: {
  token: string;
  onSuccess?: (data: { message: string; data: SubtestCategory }) => void;
  onError?: (error: AxiosError<{ message?: string }>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<{ message: string; data: SubtestCategory }>(
        `/admin/subtest-categories/${id}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-admin-subtest-categories"] });
      queryClient.invalidateQueries({ queryKey: ["get-subtest-categories"] });
      onSuccess?.(data);
    },
    onError,
  });
};

export const useDeleteSubtestCategory = ({
  token,
  onSuccess,
  onError,
}: {
  token: string;
  onSuccess?: (data: { message: string }) => void;
  onError?: (error: AxiosError<{ message?: string }>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<{ message: string }>(
        `/admin/subtest-categories/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-admin-subtest-categories"] });
      queryClient.invalidateQueries({ queryKey: ["get-subtest-categories"] });
      onSuccess?.(data);
    },
    onError,
  });
};
