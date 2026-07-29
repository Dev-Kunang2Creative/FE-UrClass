import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { UserTryoutAccess } from "@/types/tryout/tryout";
import { api } from "@/lib/axios";

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface GetTryoutParticipantsResponse {
  data: {
    data: UserTryoutAccess[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export const getTryoutParticipants = async (
  id: string,
  token: string,
  page: number = 1,
  search: string = "",
  status: string = "all",
  perPage: number = 15,
): Promise<GetTryoutParticipantsResponse> => {
  const { data } = await api.get(
    `/admin/tryouts/${id}/participants?page=${page}&per_page=${perPage}&search=${search}&status=${status}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetTryoutParticipants = (
  id: string,
  token: string,
  page: number,
  search: string,
  status: string,
  perPage: number,
  options?: Partial<UseQueryOptions<GetTryoutParticipantsResponse, AxiosError>>,
) => {
  return useQuery<GetTryoutParticipantsResponse>({
    queryKey: ["tryout-participants", id, page, search, status, perPage],
    queryFn: () =>
      getTryoutParticipants(id, token, page, search, status, perPage),
    ...options,
  });
};
