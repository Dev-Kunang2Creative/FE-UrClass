import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { ErrorResponse } from "@/types/metadata/metadata";
import { Subtest } from "@/types/subtest/subtest";
import { SubtestType } from "@/validators/subtest/subtest-validator";

interface CreateSubtestResponse {
  subtest: Subtest;
}

export const CreateSubtestHandler = async (
  body: SubtestType,
  token: string,
) => {
  const { data } = await api.post("/admin/subtests", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const useCreateSubtest = (
  options?: UseMutationOptions<
    CreateSubtestResponse,
    AxiosError<ErrorResponse>,
    SubtestType
  >,
) => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (body) =>
      CreateSubtestHandler(body, session?.access_token ?? ""),
    ...options,
  });
};
