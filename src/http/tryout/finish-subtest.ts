import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { SubtestSession } from "@/types/exam/exam";

interface FinishSubtestResponse {
  message: string;
  data: SubtestSession;
}

export const FinishSubtestHandler = async (
  tryoutId: string,
  subtestId: string,
  token: string
): Promise<FinishSubtestResponse> => {
  const { data } = await api.post<FinishSubtestResponse>(
    `/tryouts/${tryoutId}/subtests/${subtestId}/finish`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useFinishSubtest = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<FinishSubtestResponse, AxiosError, { tryoutId: string; subtestId: string }>>;
}) => {
  return useMutation({
    mutationFn: ({ tryoutId, subtestId }: { tryoutId: string; subtestId: string }) =>
      FinishSubtestHandler(tryoutId, subtestId, token),
    ...options,
  });
};
