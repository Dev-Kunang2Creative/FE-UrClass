import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { User } from "@/types/user/user";

export interface GetAllUsersResponse {
  data: User[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export const GetAllUsersHandler = async (
  token: string,
  page = 1,
  search = "",
  perPage = 15
): Promise<GetAllUsersResponse> => {
  const { data } = await api.get<GetAllUsersResponse>("/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, search: search || undefined, per_page: perPage },
  });
  return data;
};

export const GetAllUsersForExportHandler = async (
  token: string,
  search = "",
): Promise<User[]> => {
  const perPage = 100;
  const firstPage = await GetAllUsersHandler(token, 1, search, perPage);
  const rows = [...firstPage.data];

  for (let page = 2; page <= firstPage.last_page; page += 1) {
    const nextPage = await GetAllUsersHandler(token, page, search, perPage);
    rows.push(...nextPage.data);
  }

  return rows;
};

export const useGetAllUsers = ({
  token,
  page = 1,
  search = "",
  perPage = 15,
  options,
}: {
  token: string;
  page?: number;
  search?: string;
  perPage?: number;
  options?: Partial<UseQueryOptions<GetAllUsersResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-all-users", page, search, perPage],
    queryFn: () => GetAllUsersHandler(token, page, search, perPage),
    enabled: !!token,
    ...options,
  });
};
