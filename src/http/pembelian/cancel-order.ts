import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface CancelOrderPayload {
  orderId: string;
  token: string;
}

interface CancelOrderResponse {
  message: string;
}

export const CancelOrderHandler = async ({
  orderId,
  token,
}: CancelOrderPayload): Promise<CancelOrderResponse> => {
  const { data } = await api.post<CancelOrderResponse>(
    `/orders/${orderId}/cancel`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useCancelOrder = (
  options?: Partial<UseMutationOptions<CancelOrderResponse, AxiosError, CancelOrderPayload>>
) => {
  return useMutation({
    mutationFn: CancelOrderHandler,
    ...options,
  });
};
