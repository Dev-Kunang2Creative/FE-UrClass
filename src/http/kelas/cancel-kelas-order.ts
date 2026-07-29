import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface CancelKelasOrderPayload {
  orderId: string;
  token: string;
}

interface CancelKelasOrderResponse {
  message: string;
}

export const CancelKelasOrderHandler = async ({
  orderId,
  token,
}: CancelKelasOrderPayload): Promise<CancelKelasOrderResponse> => {
  const { data } = await api.post<CancelKelasOrderResponse>(
    `/kelas-orders/${orderId}/cancel`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useCancelKelasOrder = (
  options?: Partial<
    UseMutationOptions<
      CancelKelasOrderResponse,
      AxiosError,
      CancelKelasOrderPayload
    >
  >
) => {
  return useMutation({
    mutationFn: CancelKelasOrderHandler,
    ...options,
  });
};
