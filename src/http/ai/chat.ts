import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatStatus {
  is_available: boolean;
  daily_limit: number;
  used_today: number;
  max_message_length: number;
}

interface SendResult {
  data: {
    reply: string;
    used_today: number;
    daily_limit: number;
  };
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

/**
 * Keadaan asisten, dipakai untuk memutuskan apakah tombolnya dirender.
 *
 * Frontend tidak tahu - dan tidak perlu tahu - provider, endpoint, maupun model
 * yang dipakai. Yang diketahuinya hanya: tersedia atau tidak, dan sisa kuota.
 * Itu memang batas informasinya: kredensial tidak boleh pernah sampai ke sini.
 */
export const useChatStatus = ({ token }: { token: string }) =>
  useQuery({
    queryKey: ["chat-status"],
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get<{ data: ChatStatus }>("/chat/status", auth(token));
      return data.data;
    },
  });

/**
 * Mengirim satu pesan.
 *
 * Riwayat dikirim dari klien karena percakapan tidak disimpan di server -
 * tidak ada transkrip belajar yang mengendap di database. Isinya tetap disaring
 * dan dipotong server, jadi mengirim riwayat panjang tidak menaikkan biaya.
 */
export const useSendChat = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<
    SendResult,
    AxiosError<{ message?: string }>,
    { message: string; history: ChatTurn[] }
  >({
    mutationFn: async ({ message, history }) => {
      const { data } = await api.post<SendResult>("/chat", { message, history }, auth(token));
      return data;
    },
    onSuccess: (result) => {
      // Sisa kuota di status ikut disegarkan supaya angka yang tampil di
      // jendela chat tidak berbeda dari yang dihitung server.
      queryClient.setQueryData<ChatStatus>(["chat-status"], (prev) =>
        prev ? { ...prev, used_today: result.data.used_today } : prev,
      );
    },
  });
};
