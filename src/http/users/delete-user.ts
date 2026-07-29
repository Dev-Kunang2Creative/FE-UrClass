import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface DeleteUserPayload {
  id: string;
  token: string;
}

interface DeleteUserResponse {
  message: string;
}

export const DeleteUserHandler = async ({ id, token }: DeleteUserPayload) => {
  const { data } = await api.delete<DeleteUserResponse>(`/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const useDeleteUser = (
  options?: UseMutationOptions<DeleteUserResponse, AxiosError<{ message: string }>, DeleteUserPayload>
) => {
  return useMutation({
    mutationFn: DeleteUserHandler,
    ...options,
  });
};
