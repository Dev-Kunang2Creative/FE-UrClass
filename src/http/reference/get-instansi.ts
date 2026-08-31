import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface InstansiOption {
  id: string;
  kode: string | null;
  nama: string;
  tingkat: "pusat" | "daerah";
  formasi_count?: number;
}

export interface FormasiOption {
  id: string;
  nama: string;
  jenjang: string | null;
  instansi?: { id: string; nama: string } | null;
}

interface Paginated<T> {
  data: T[];
}

/**
 * Instansi tujuan pelamar CPNS umum: kementerian, lembaga, atau pemda.
 *
 * Sengaja dibuat sebangun dengan useSearchPerguruanTinggi - dua tingkat pilihan
 * yang dicari lewat teks - supaya ReferenceCombobox yang sama bisa dipakai
 * tanpa komponen baru.
 *
 * Tabelnya bisa saja masih kosong: data resminya diisi lewat seeder dari berkas
 * BKN. Picker-nya tetap menerima ketikan manual, jadi form tetap bisa diisi.
 */
export const useSearchInstansi = ({
  search,
  token,
  enabled = true,
}: {
  search: string;
  token: string;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: ["instansi", search],
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await api.get<Paginated<InstansiOption>>("/instansi", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: search || undefined, per_page: 30 },
      });
      return data.data;
    },
  });

/**
 * Formasi milik satu instansi, atau lintas instansi kalau belum dipilih.
 *
 * Formasi yang sama bisa dibuka banyak instansi, jadi begitu instansinya
 * diketahui daftarnya dipersempit ke sana - sama seperti program studi terhadap
 * kampusnya.
 */
export const useFormasi = ({
  instansiId,
  search,
  token,
  enabled = true,
}: {
  instansiId: string | null;
  search: string;
  token: string;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: ["formasi", instansiId ?? "semua", search],
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const url = instansiId ? `/instansi/${instansiId}/formasi` : "/formasi";
      const { data } = await api.get<Paginated<FormasiOption>>(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: search || undefined, per_page: 30 },
      });
      return data.data;
    },
  });
