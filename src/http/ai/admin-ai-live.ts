import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * Tinggal dua sejak jendelanya dipatok satu menit: `waiting` untuk permintaan
 * yang sedang berjalan, `active` untuk sisanya - apa pun yang masih ada di
 * jendela ini memang baru saja terjadi.
 */
export type NodeState = "waiting" | "active";

export interface LiveNode {
  user_id: string;
  name: string;
  email: string | null;
  role: string | null;
  state: NodeState;
  /** Sudah berapa detik menunggu jawaban. Hanya untuk state waiting. */
  waiting_seconds: number | null;
  /** null kalau permintaan pertamanya belum selesai. */
  last_seen_at: string | null;
  seconds_ago: number | null;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_idr: number;
  failed: number;
  avg_duration_ms: number;
  last_model: string | null;
  last_status: string | null;
}

/**
 * Satu permintaan terakhir.
 *
 * Dikenali dari penggunanya, bukan dari modelnya - halaman ini menjawab
 * "siapa", dan model di UrClass hampir selalu satu dan sama.
 */
export interface LiveRequest {
  id: string;
  name: string;
  email: string | null;
  input_tokens: number;
  output_tokens: number;
  status: string;
  created_at: string | null;
  seconds_ago: number | null;
}


export interface LiveUsage {
  now: string;
  /** Umur maksimal sebuah node. Ditentukan server, tidak bisa disetel. */
  node_ttl_minutes: number;
  nodes: LiveNode[];
  /** Tidak dibatasi umur node - lihat catatan di AdminAiLiveController. */
  recent: LiveRequest[];
}

/**
 * Selang penyegaran, dalam milidetik.
 *
 * Lima detik: cukup cepat untuk terasa langsung, cukup jarang untuk tidak
 * membanjiri database dengan kueri agregat. Seluruh datanya berasal dari
 * database sendiri - tidak ada panggilan ke provider di jalur ini - jadi
 * penyegaran berulang tidak memakan kuota maupun biaya.
 */
const SELANG_MS = 5_000;

export const useAiLive = ({
  token,
  enabled = true,
}: {
  token: string;
  /** Dimatikan saat tabnya tidak terlihat, supaya tidak menyegar di latar. */
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: ["admin-ai-live"],
    enabled: !!token && enabled,
    refetchInterval: SELANG_MS,
    // Ditahan sejenak supaya angka lama tidak berkedip jadi kerangka setiap
    // lima detik. Data sebelumnya tetap ditampilkan sampai yang baru tiba.
    placeholderData: (sebelumnya) => sebelumnya,
    queryFn: async () => {
      const { data } = await api.get<{ data: LiveUsage }>("/admin/ai-live", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data;
    },
  });
