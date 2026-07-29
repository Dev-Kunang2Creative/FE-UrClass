import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { Transaction } from "@/types/transactions/transaction";

interface GetDetailTransactionResponse {
  data: Transaction;
}

export const GetDetailTransactionHandler = async (
  id: string,
  token: string,
): Promise<GetDetailTransactionResponse> => {
  const { data } = await api.get<GetDetailTransactionResponse>(
    `/admin/orders/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const useGetDetailTransaction = ({
  id,
  token,
  options,
}: {
  id: string;
  token: string;
  options?: Partial<UseQueryOptions<GetDetailTransactionResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-detail-transaction", id],
    queryFn: () => GetDetailTransactionHandler(id, token),
    enabled: !!token && !!id,
    ...options,
  });
};
