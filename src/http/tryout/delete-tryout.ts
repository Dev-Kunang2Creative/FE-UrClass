import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Tryout } from "@/types/tryout/tryout";

interface DeleteTryoutPayload {
  id: string;
  token: string;
}

interface DeleteTryoutResponse {
  data: Tryout;
}

export const DeleteTryoutHandler = async ({
  id,
  token,
}: DeleteTryoutPayload): Promise<DeleteTryoutResponse> => {
  const { data } = await api.delete(`/admin/tryouts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useDeleteTryout = (
  options?: UseMutationOptions<
    DeleteTryoutResponse,
    AxiosError<ErrorResponse>,
    DeleteTryoutPayload
  >,
) => {
  return useMutation({
    mutationFn: DeleteTryoutHandler,
    ...options,
  });
};
