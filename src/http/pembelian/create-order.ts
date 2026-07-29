import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { CreateOrderResponse } from "@/types/package/package";

interface CreateOrderPayload {
  package_id: string;
}

export const CreateOrderHandler = async (
  payload: CreateOrderPayload,
  token: string
): Promise<CreateOrderResponse> => {
  const { data } = await api.post<CreateOrderResponse>("/orders", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const useCreateOrder = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<CreateOrderResponse, AxiosError, CreateOrderPayload>>;
}) => {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => CreateOrderHandler(payload, token),
    ...options,
  });
};
