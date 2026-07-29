import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface VerifyKelasPaymentPayload {
  orderId: string;
  token: string;
}

interface VerifyKelasPaymentResponse {
  message: string;
  status: string;
  ticket_balance?: number;
}

export const VerifyKelasPaymentHandler = async ({
  orderId,
  token,
}: VerifyKelasPaymentPayload): Promise<VerifyKelasPaymentResponse> => {
  const { data } = await api.post<VerifyKelasPaymentResponse>(
    `/kelas-orders/${orderId}/verify-payment`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useVerifyKelasPayment = (
  options?: Partial<
    UseMutationOptions<
      VerifyKelasPaymentResponse,
      AxiosError,
      VerifyKelasPaymentPayload
    >
  >
) => {
  return useMutation({
    mutationFn: VerifyKelasPaymentHandler,
    ...options,
  });
};
