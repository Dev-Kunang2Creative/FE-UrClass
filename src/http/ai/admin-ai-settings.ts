import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/axios";

export type AiProvider = "openai_compatible" | "anthropic";

export interface AiModel {
  id: string;
  name: string | null;
}

/** Kredensial yang dikirim untuk sekali pakai - menguji, bukan menyimpan. */
export interface ProbePayload {
  provider?: AiProvider;
  endpoint?: string;
  api_key?: string;
  model?: string;
}

export interface AiSettings {
  provider: AiProvider;
  endpoint: string | null;
  model: string | null;
  system_prompt: string;
  max_tokens: number;
  temperature_x100: number;
  price_input_per_mtok: number;
  price_output_per_mtok: number;
  price_cached_per_mtok: number;
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
  price_input_per_mtok: number;
  price_output_per_mtok: number;
  price_cached_per_mtok: number;
  daily_message_limit: number;
  history_limit: number;
  is_active: boolean;
}

interface TestResult {
  message: string;
  data: { reply: string; model: string; usage: { input_tokens: number; output_tokens: number } };
}

/** Galat provider untuk admin: status plus potongan badan galat, kunci disensor. */
interface ProviderError {
  message?: string;
  detail?: string | null;
  errors?: Record<string, string[]>;
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
 * Mengirim isi form, bukan mengandalkan yang tersimpan. Sebelumnya ia menguji
 * baris tersimpan, sehingga admin yang mengetik kunci lalu langsung menekan uji
 * justru menguji kunci lama - dan menerima 401 yang tampak seperti kunci
 * barunya salah. Yang dikirim tidak disimpan; ia hanya dipakai untuk satu
 * permintaan keluar.
 */
export const useTestAiConnection = ({ token }: { token: string }) =>
  useMutation<TestResult, AxiosError<ProviderError>, ProbePayload | void>({
    mutationFn: async (probe) => {
      const { data } = await api.post<TestResult>(
        "/admin/ai-settings/test",
        probe ?? {},
        auth(token),
      );
      return data;
    },
  });

/**
 * Daftar model yang tersedia di endpoint yang sedang diisi.
 *
 * Supaya admin memilih dari daftar alih-alih menghafal id model. Memakai isi
 * form dengan alasan yang sama seperti uji koneksi: daftarnya dibutuhkan justru
 * saat kredensialnya baru diketik dan belum disimpan.
 */
export const useLoadAiModels = ({ token }: { token: string }) =>
  useMutation<
    { message: string; data: AiModel[] },
    AxiosError<ProviderError>,
    ProbePayload | void
  >({
    mutationFn: async (probe) => {
      const { data } = await api.post("/admin/ai-settings/models", probe ?? {}, auth(token));
      return data;
    },
  });
