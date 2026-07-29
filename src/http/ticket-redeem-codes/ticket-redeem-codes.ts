import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export interface TicketRedeemCode {
  id: string;
  code: string;
  ticket_amount: number;
  quota: number;
  used_count: number;
  is_active: boolean;
  expired_at: string | null;
  created_at: string;
  updated_at: string;
  redemptions_count?: number;
}

export interface TicketRedeemPayload {
  code?: string;
  ticket_amount: number;
  quota: number;
  is_active: boolean;
  expired_at?: string | null;
}

interface ListResponse {
  data: TicketRedeemCode[];
}

interface MutationResponse {
  message: string;
  data: TicketRedeemCode;
}

export const useGetTicketRedeemCodes = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseQueryOptions<ListResponse, AxiosError>>;
}) => {
  return useQuery({
    queryKey: ["ticket-redeem-codes"],
    queryFn: async () => {
      const { data } = await api.get<ListResponse>("/admin/ticket-redeem-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token,
    ...options,
  });
};

export const useCreateTicketRedeemCode = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<MutationResponse, AxiosError, TicketRedeemPayload>>;
}) => {
  return useMutation({
    mutationFn: async (payload: TicketRedeemPayload) => {
      const { data } = await api.post<MutationResponse>("/admin/ticket-redeem-codes", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    ...options,
  });
};

export const useUpdateTicketRedeemCode = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<MutationResponse, AxiosError, { id: string; payload: TicketRedeemPayload }>>;
}) => {
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<MutationResponse>(`/admin/ticket-redeem-codes/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    ...options,
  });
};

export const useDeleteTicketRedeemCode = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<{ message: string }, AxiosError, string>>;
}) => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<{ message: string }>(`/admin/ticket-redeem-codes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    ...options,
  });
};
