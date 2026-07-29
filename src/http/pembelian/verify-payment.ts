import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface VerifyPaymentPayload {
  orderId: string;
  token: string;
}

interface VerifyPaymentResponse {
  message: string;
  status: string;
  ticket_balance?: number;
}

export const VerifyPaymentHandler = async ({
  orderId,
  token,
}: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
  const { data } = await api.post<VerifyPaymentResponse>(
    `/orders/${orderId}/verify-payment`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useVerifyPayment = (
  options?: Partial<UseMutationOptions<VerifyPaymentResponse, AxiosError, VerifyPaymentPayload>>
) => {
  return useMutation({
    mutationFn: VerifyPaymentHandler,
    ...options,
  });
};
