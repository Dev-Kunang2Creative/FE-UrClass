import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface DeleteKelasAdminPayload {
  id: string;
  token: string;
}

interface DeleteKelasAdminResponse {
  message: string;
}

export const DeleteKelasAdminHandler = async ({
  id,
  token,
}: DeleteKelasAdminPayload): Promise<DeleteKelasAdminResponse> => {
  const { data } = await api.delete<DeleteKelasAdminResponse>(
    `/admin/kelas/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

export const useDeleteKelasAdmin = (
  options?: Partial<
    UseMutationOptions<
      DeleteKelasAdminResponse,
      AxiosError,
      DeleteKelasAdminPayload
    >
  >
) => {
  return useMutation({
    mutationFn: DeleteKelasAdminHandler,
    ...options,
  });
};
