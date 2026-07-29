import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { ErrorResponse } from "@/types/metadata/metadata";

interface DeleteSubtestFromTryoutPayload {
  tryoutId: string;
  tryoutSubtestId: string;
  token: string;
}

interface DeleteSubtestFromTryoutResponse {
  message: string;
}

export const DeleteSubtestFromTryoutHandler = async ({
  tryoutId,
  tryoutSubtestId,
  token,
}: DeleteSubtestFromTryoutPayload): Promise<DeleteSubtestFromTryoutResponse> => {
  const { data } = await api.delete(
    `/admin/tryouts/${tryoutId}/subtests/${tryoutSubtestId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useDeleteSubtestFromTryout = (
  options?: UseMutationOptions<
    DeleteSubtestFromTryoutResponse,
    AxiosError<ErrorResponse>,
    DeleteSubtestFromTryoutPayload
  >,
) => {
  return useMutation({
    mutationFn: DeleteSubtestFromTryoutHandler,
    ...options,
  });
};
