import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { TrackCard } from "@/types/track-card/track-card";

/**
 * Teks kartu pemilihan jalur.
 *
 * Terbuka tanpa token: isinya memang teks publik, dan halaman pemilihan perlu
 * menampilkannya sebelum peserta memilih apa pun. Backend selalu mengembalikan
 * kedua kartu secara utuh - yang belum pernah diubah admin terisi teks
 * bawaannya - jadi pemanggilnya tidak perlu menyiapkan cadangan sendiri.
 */
export const useGetTrackCards = () =>
  useQuery({
    queryKey: ["track-cards"],
    queryFn: async () => {
      const { data } = await api.get<{ data: TrackCard[] }>("/track-cards");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
