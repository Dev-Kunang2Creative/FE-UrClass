import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { TryoutSession } from "@/types/exam/exam";

interface FinishTryoutResponse {
  message: string;
  data: TryoutSession;
}

export const FinishTryoutHandler = async (
  tryoutId: string,
  token: string
): Promise<FinishTryoutResponse> => {
  const { data } = await api.post<FinishTryoutResponse>(
    `/tryouts/${tryoutId}/finish`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useFinishTryout = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<FinishTryoutResponse, AxiosError, string>>;
}) => {
  return useMutation({
    mutationFn: (tryoutId: string) => FinishTryoutHandler(tryoutId, token),
    ...options,
  });
};
