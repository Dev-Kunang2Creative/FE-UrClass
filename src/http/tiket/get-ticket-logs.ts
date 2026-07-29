import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export interface TicketLog {
  id: string;
  type: "credit" | "debit";
  amount: number;
  source: "paket" | "kelas" | "redeem" | "tryout";
  description: string;
  created_at: string;
}

export interface GetTicketLogsResponse {
  data: TicketLog[];
}

export const GetTicketLogsHandler = async (token: string): Promise<GetTicketLogsResponse> => {
  const { data } = await api.get<GetTicketLogsResponse>("/ticket-logs", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const useGetTicketLogs = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<GetTicketLogsResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["get-ticket-logs", token],
    queryFn: () => GetTicketLogsHandler(token),
    enabled: !!token,
    ...options,
  });
};
