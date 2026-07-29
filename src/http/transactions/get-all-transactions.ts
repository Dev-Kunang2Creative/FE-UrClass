import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Transaction } from "@/types/transactions/transaction";

export interface GetAllTransactionResponse {
  data: Transaction[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export const GetAllTransactionHandler = async (
  token: string,
  page = 1,
  perPage = 15,
  search = ""
): Promise<GetAllTransactionResponse> => {
  const { data } = await api.get<GetAllTransactionResponse>("/admin/orders", {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, per_page: perPage, search: search || undefined },
  });
  return data;
};

export const GetAllTransactionsForExportHandler = async (
  token: string,
  search = "",
): Promise<Transaction[]> => {
  const perPage = 100;
  const firstPage = await GetAllTransactionHandler(token, 1, perPage, search);
  const rows = [...firstPage.data];

  for (let page = 2; page <= firstPage.last_page; page += 1) {
    const nextPage = await GetAllTransactionHandler(token, page, perPage, search);
    rows.push(...nextPage.data);
  }

  return rows;
};

export const useGetAllTransaction = ({
  token,
  page = 1,
  perPage = 15,
  search = "",
  options,
}: {
  token: string;
  page?: number;
  perPage?: number;
  search?: string;
  options?: Partial<UseQueryOptions<GetAllTransactionResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-all-transactions", page, perPage, search],
    queryFn: () => GetAllTransactionHandler(token, page, perPage, search),
    enabled: !!token,
    ...options,
  });
};
