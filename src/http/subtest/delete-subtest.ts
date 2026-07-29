import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Subtest } from "@/types/subtest/subtest";

interface DeleteSubtestPayload {
  id: string;
  token: string;
}

interface DeleteSubtestResponse {
  data: Subtest;
}

export const DeleteSubtestHandler = async ({
  id,
  token,
}: DeleteSubtestPayload): Promise<DeleteSubtestResponse> => {
  const { data } = await api.delete(`/admin/subtests/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useDeleteSubtest = (
  options?: UseMutationOptions<
    DeleteSubtestResponse,
    AxiosError<ErrorResponse>,
    DeleteSubtestPayload
  >,
) => {
  return useMutation({
    mutationFn: DeleteSubtestHandler,
    ...options,
  });
};
