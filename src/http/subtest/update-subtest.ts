import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Subtest } from "@/types/subtest/subtest";
import { SubtestType } from "@/validators/subtest/subtest-validator";

interface UpdateSubtestResponse {
  data: Subtest;
}

export const UpdateSubtestHandler = async (
  id: string,
  body: SubtestType,
  token: string,
): Promise<UpdateSubtestResponse> => {
  const { data } = await api.put(`/admin/subtests/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const useUpdateSubtest = (
  options?: UseMutationOptions<
    UpdateSubtestResponse,
    AxiosError<ErrorResponse>,
    { id: string; body: SubtestType }
  >,
) => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: ({ id, body }) =>
      UpdateSubtestHandler(id, body, session?.access_token ?? ""),
    ...options,
  });
};
