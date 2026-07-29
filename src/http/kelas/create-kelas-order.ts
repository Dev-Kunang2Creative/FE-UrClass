import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { KelasOrder } from "@/types/kelas/kelas";

interface CreateKelasOrderPayload {
  kelas_id: string;
}

interface CreateKelasOrderResponse {
  message: string;
  data: KelasOrder;
  snap_token: string;
}

export const CreateKelasOrderHandler = async (
  payload: CreateKelasOrderPayload,
  token: string
): Promise<CreateKelasOrderResponse> => {
  const { data } = await api.post<CreateKelasOrderResponse>(
    "/kelas-orders",
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

export const useCreateKelasOrder = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<
    UseMutationOptions<
      CreateKelasOrderResponse,
      AxiosError,
      CreateKelasOrderPayload
    >
  >;
}) => {
  return useMutation({
    mutationFn: (payload: CreateKelasOrderPayload) =>
      CreateKelasOrderHandler(payload, token),
    ...options,
  });
};
