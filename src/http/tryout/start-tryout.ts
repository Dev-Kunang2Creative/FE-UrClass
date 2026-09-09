import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";
import type { TryoutSession } from "@/types/exam/exam";

export interface StartTryoutResponse {
  message: string;
  data: TryoutSession;
  /**
   * Terisi hanya ketika percobaan ini memotong tiket - yaitu pengulangan
   * tryout premium. Percobaan pertama sudah dibayar saat mendaftar, dan sesi
   * yang dilanjutkan tidak menagih apa pun.
   */
  ticket_balance_remaining?: number | null;
}

export const StartTryoutHandler = async (
  tryoutId: string,
  token: string
): Promise<StartTryoutResponse> => {
  const { data } = await api.post<StartTryoutResponse>(
    `/tryouts/${tryoutId}/start`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const useStartTryout = ({
  token,
  options,
}: {
  token: string;
  options?: Partial<UseMutationOptions<StartTryoutResponse, AxiosError, string>>;
}) => {
  return useMutation({
    mutationFn: (tryoutId: string) => StartTryoutHandler(tryoutId, token),
    ...options,
  });
};
