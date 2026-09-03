import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type UsageWindow = "today" | "24h" | "7d" | "30d" | "60d";

export interface UsageTotals {
  requests: number;
  ok: number;
  failed: number;
  blocked: number;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  cost_usd: number;
  avg_duration_ms: number;
}

export interface UsagePoint {
  bucket: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface UsageByModel {
  model: string;
  requests: number;
  total_tokens: number;
  cost_usd: number;
}

export interface UsageTopUser {
  name: string;
  email: string | null;
  requests: number;
  total_tokens: number;
  cost_usd: number;
}

export interface UsageRecent {
  id: string;
  created_at: string;
  user_name: string;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  status: "ok" | "failed" | "blocked";
  reason: string | null;
  duration_ms: number;
}

export interface UsageReport {
  window: UsageWindow;
  windows: { key: UsageWindow; label: string }[];
  since: string;
  bucket: "hour" | "day";
  totals: UsageTotals;
  series: UsagePoint[];
  by_model: UsageByModel[];
  top_users: UsageTopUser[];
  recent: UsageRecent[];
}

/**
 * Laporan pemakaian asisten AI.
 *
 * Jendela waktunya bagian dari kunci query, jadi berpindah jendela memakai
 * data yang sudah di-cache alih-alih memuat ulang dari nol - dan kembali ke
 * jendela sebelumnya terasa seketika.
 *
 * staleTime pendek karena angkanya bergerak: admin yang membuka halaman ini
 * biasanya sedang memeriksa sesuatu yang baru terjadi.
 */
export const useAiUsage = ({
  token,
  window,
}: {
  token: string;
  window: UsageWindow;
}) =>
  useQuery({
    queryKey: ["admin-ai-usage", window],
    enabled: !!token,
    staleTime: 30 * 1000,
    queryFn: async () => {
      const { data } = await api.get<{ data: UsageReport }>("/admin/ai-usage", {
        headers: { Authorization: `Bearer ${token}` },
        params: { window },
      });
      return data.data;
    },
  });
