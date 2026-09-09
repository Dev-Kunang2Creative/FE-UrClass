import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { User } from "@/types/user/user";

export interface TicketEntry {
  id: string;
  type: "credit" | "debit";
  amount: number;
  /** paket | kelas | redeem | tryout | admin */
  source: string;
  description: string;
  created_at: string | null;
}

export interface TicketSummary {
  balance: number;
  total_credited: number;
  total_debited: number;
  recent: TicketEntry[];
}

export interface AiUsageSummary {
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  /** Sesudah pengali model - sebanding dengan halaman pemantauan. */
  total_tokens: number;
  cost_idr: number;
  failed: number;
  used_today: number;
  last_used_at: string | null;
}

export interface UserDetail {
  data: User;
  meta: {
    tickets: TicketSummary;
    ai_usage: AiUsageSummary;
  };
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

/**
 * Detail satu pengguna: saldo tiket beserta riwayatnya, dan pemakaian asisten
 * AI.
 *
 * Diambil saat dialognya dibuka, bukan ikut dimuat bersama daftarnya: ringkasan
 * ini butuh beberapa kueri agregat per pengguna, dan menyertakannya di daftar
 * berarti menjalankan semuanya untuk lima belas orang yang lima belasnya belum
 * tentu dibuka.
 */
export const useUserDetail = ({
  token,
  userId,
}: {
  token: string;
  userId: string | null;
}) =>
  useQuery({
    queryKey: ["admin-user-detail", userId],
    enabled: !!token && !!userId,
    queryFn: async () => {
      const { data } = await api.get<UserDetail>(`/admin/users/${userId}`, auth(token));
      return data;
    },
  });

/**
 * Menambah atau mengurangi tiket.
 *
 * Angka positif menambah, negatif mengurangi. Alasan wajib - tiket bernilai uang
 * bagi peserta, dan penyesuaian tanpa alasan tidak bisa ditinjau siapa pun
 * setelahnya.
 *
 * Saldonya diverifikasi ulang server: pengurangan dibatasi sebesar saldo yang
 * ada, jadi angka yang terpakai bisa lebih kecil daripada yang diminta.
 */
export const useAdjustTickets = ({ token }: { token: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      reason,
    }: {
      userId: string;
      amount: number;
      reason: string;
    }) => {
      const { data } = await api.post<{
        message: string;
        data: { ticket_balance: number; tickets: TicketSummary };
      }>(`/admin/users/${userId}/tickets`, { amount, reason }, auth(token));

      return data;
    },
    onSuccess: (_hasil, { userId }) => {
      // Daftar pengguna ikut disegarkan: kolom tiketnya ada di situ, dan angka
      // yang tertinggal di belakang membuat admin mengira penyesuaiannya gagal.
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
    },
  });
};
