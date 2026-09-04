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
  cost_idr: number;
  avg_duration_ms: number;
}

export interface UsagePoint {
  bucket: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_idr: number;
}

export interface UsageTopUser {
  name: string;
  email: string | null;
  requests: number;
  total_tokens: number;
  cost_idr: number;
}


export type UsageBucket = "hour" | "day";

export interface UsageReport {
  window: UsageWindow;
  /** `hourly` menyatakan apakah jendela itu boleh dilihat per jam. */
  windows: { key: UsageWindow; label: string; hourly: boolean }[];
  since: string;
  bucket: UsageBucket;
  totals: UsageTotals;
  series: UsagePoint[];
  /** Ember dengan token terbanyak, dihitung server dari seri yang sama. */
  peak: UsagePoint | null;
  top_users: UsageTopUser[];
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
  bucket,
}: {
  token: string;
  window: UsageWindow;
  bucket?: UsageBucket;
}) =>
  useQuery({
    queryKey: ["admin-ai-usage", window, bucket ?? "auto"],
    enabled: !!token,
    staleTime: 30 * 1000,
    queryFn: async () => {
      const { data } = await api.get<{ data: UsageReport }>("/admin/ai-usage", {
        headers: { Authorization: `Bearer ${token}` },
        params: { window, bucket },
      });
      return data.data;
    },
  });
