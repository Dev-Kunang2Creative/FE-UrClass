import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

interface StartSubtestResponse {
  message: string;
  data: {
    subtest_session_id: string;
    started_at: string;
    end_time: string;
    remaining_seconds: number;
    status: string;
  };
}

export const StartSubtestHandler = async (
  tryoutId: string,
  subtestId: string,
  token: string
): Promise<StartSubtestResponse> => {
  const { data } = await api.post<StartSubtestResponse>(
    `/tryouts/${tryoutId}/subtests/${subtestId}/start`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useStartSubtest = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<StartSubtestResponse, AxiosError, { tryoutId: string; subtestId: string }>>;
}) => {
  return useMutation({
    mutationFn: ({ tryoutId, subtestId }: { tryoutId: string; subtestId: string }) =>
      StartSubtestHandler(tryoutId, subtestId, token),
    ...options,
  });
};
