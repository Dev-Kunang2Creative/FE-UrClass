import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface AiQuota {
  name: string | null;
  status: string | null;
  /** null berarti provider tidak memberi tahu — bukan nol. */
  max_tokens: number | null;
  remaining_tokens: number | null;
  used_percent: number | null;
  used_tokens: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cached_tokens: number | null;
  requests: number | null;
  expires_at: string | null;
  /** Panjang masa berlaku paketnya, bukan sisa hari - sisanya dihitung dari expires_at. */
  valid_days: number | null;
  penalty_active: boolean;
  penalty_reason: string | null;
  penalty_until: string | null;
  /**
   * Sisa hari sampai kedaluwarsa, dihitung saat pengambilan.
   *
   * Bukan dari provider: yang dikirimnya (`validDays`) adalah panjang masa
   * berlaku paketnya, bukan sisanya. Dihitung di sini dan bukan saat render
   * karena membaca jam sistem selama render dilarang React 19
   * (react-hooks/purity) - hasilnya bisa berubah di antara dua render tanpa
   * sebab yang terlihat.
   */
  days_left: number | null;
}

export interface AiQuotaReport {
  /** Sebagian gateway tidak menyediakan endpoint kuota — itu bukan kerusakan. */
  supported: boolean;
  configured: boolean;
  quota: AiQuota | null;
  message: string | null;
}

/**
 * Kuota yang tersisa di provider.
 *
 * Diambil server, jadi endpoint dan kunci tidak pernah sampai ke browser.
 *
 * Ini satu-satunya angka penting yang tidak bisa diketahui dari catatan
 * aplikasi sendiri: pemakaian dari sumber lain - pengujian manual, aplikasi lain
 * yang memakai kunci yang sama - juga memotong kuota, dan hanya provider yang
 * tahu sisanya.
 *
 * retry dimatikan: gateway yang tidak mendukungnya akan selalu gagal, dan
 * mencoba ulang hanya menunda pesan "tidak didukung" yang sudah pasti.
 */
export const useAiQuota = ({ token }: { token: string }) =>
  useQuery({
    queryKey: ["admin-ai-quota"],
    enabled: !!token,
    staleTime: 60 * 1000,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get<{ data: AiQuotaReport }>("/admin/ai-quota", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const laporan = data.data;

      if (laporan.quota) {
        laporan.quota.days_left = laporan.quota.expires_at
          ? Math.ceil(
              (new Date(laporan.quota.expires_at).getTime() - Date.now()) / 86_400_000,
            )
          : null;
      }

      return laporan;
    },
  });
