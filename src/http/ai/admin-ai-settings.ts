import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export type AiProvider = "openai_compatible" | "anthropic";

export interface AiSettings {
  provider: AiProvider;
  endpoint: string | null;
  model: string | null;
  system_prompt: string;
  max_tokens: number;
  temperature_x100: number;
  daily_message_limit: number;
  history_limit: number;
  is_active: boolean;
  /** Apakah sudah ada kunci terpasang. Kuncinya sendiri tidak pernah dikirim. */
  has_api_key: boolean;
  /** Bentuk tersamar, mis. "sk-or-…4f2a". Tidak bisa dipakai. */
  api_key_masked: string | null;
  providers: AiProvider[];
  updated_at: string | null;
}

export interface AiSettingsPayload {
  provider: AiProvider;
  endpoint: string;
  /** Dikosongkan berarti "jangan ubah kunci yang sudah ada". */
  api_key: string;
  model: string;
  system_prompt: string;
  max_tokens: number;
  temperature_x100: number;
  daily_message_limit: number;
  history_limit: number;
  is_active: boolean;
}

interface TestResult {
  message: string;
  data: { reply: string; model: string; usage: { input_tokens: number; output_tokens: number } };
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export const useAiSettings = ({ token }: { token: string }) =>
  useQuery({
    queryKey: ["admin-ai-settings"],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get<{ data: AiSettings }>("/admin/ai-settings", auth(token));
      return data.data;
    },
  });

export const useSaveAiSettings = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: AiSettings },
    AxiosError<{ message?: string; errors?: Record<string, string[]> }>,
    AiSettingsPayload
  >({
    mutationFn: async (body) => {
      const { data } = await api.put("/admin/ai-settings", body, auth(token));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-settings"] });
      // Peserta membaca endpoint berbeda; mengaktifkan atau mematikan asisten
      // harus langsung mengubah apakah tombolnya muncul.
      queryClient.invalidateQueries({ queryKey: ["chat-status"] });
    },
  });
};

/**
 * Uji koneksi ke provider dengan satu pesan pendek.
 *
 * Ada supaya admin tidak perlu menebak apakah kredensialnya benar dengan
 * membuka jendela chat sebagai peserta.
 */
export const useTestAiConnection = ({ token }: { token: string }) =>
  useMutation<TestResult, AxiosError<{ message?: string }>, void>({
    mutationFn: async () => {
      const { data } = await api.post<TestResult>("/admin/ai-settings/test", {}, auth(token));
      return data;
    },
  });
