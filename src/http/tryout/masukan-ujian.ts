import { api } from "@/lib/axios";

export const kategoriMasukan = [
  ["kualitas_soal", "Kualitas Soal"],
  ["kesesuaian_waktu", "Kesesuaian Waktu"],
  ["sistem_ui", "Tampilan & Kecepatan"],
  ["kunci_jawaban", "Pembahasan"],
  ["lainnya", "Kritik Umum"],
] as const;
export type KategoriMasukan = (typeof kategoriMasukan)[number][0];
export interface MasukanUjian {
  id: string;
  rating: number;
  category: KategoriMasukan;
  comment: string;
  created_at: string;
  user: { id: string; name: string } | null;
  tryout: { id: string; title: string } | null;
}
export interface DaftarMasukan {
  data: MasukanUjian[];
  total: number;
  current_page: number;
  last_page: number;
}
export interface FilterMasukan {
  search: string;
  rating: string;
  tryout_id: string;
  page: number;
}

export async function kirimMasukan(
  tryoutId: string,
  token: string,
  payload: { rating: number; category: KategoriMasukan; comment: string },
) {
  return api.post(`/tryouts/${tryoutId}/feedback`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function ambilMasukan(
  token: string,
  filter: FilterMasukan,
): Promise<DaftarMasukan> {
  return (
    await api.get("/admin/tryouts/feedbacks", {
      params: filter,
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;
}
export async function eksporMasukan(token: string, filter: FilterMasukan) {
  const response = await api.get("/admin/tryouts/feedbacks", {
    params: { ...filter, export: "csv" },
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kritik-saran-peserta.csv";
  link.click();
  URL.revokeObjectURL(url);
}
